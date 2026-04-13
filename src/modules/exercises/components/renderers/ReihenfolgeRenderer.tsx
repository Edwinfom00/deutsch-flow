"use client";

import { useState, useMemo } from "react";
import { motion, Reorder } from "framer-motion";
import { GripVertical, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReihenfolgeItem {
  id: string;
  text: string;
  correctPosition: number;
}

interface ReihenfolgeExercise {
  type: string;
  items: ReihenfolgeItem[];
}

interface Props {
  exercise: ReihenfolgeExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function ReihenfolgeRenderer({ exercise, onAnswer, answered }: Props) {
  const shuffled = useMemo(
    () => [...exercise.items].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [items, setItems] = useState(shuffled);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    setChecked(true);
    const correct = items.filter((item, i) => item.correctPosition === i + 1).length;
    const score = Math.round((correct / items.length) * 100);
    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  const isItemCorrect = (item: ReihenfolgeItem, index: number) =>
    answered && item.correctPosition === index + 1;

  const isItemWrong = (item: ReihenfolgeItem, index: number) =>
    answered && item.correctPosition !== index + 1;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Glisse les paragraphes pour les remettre dans le bon ordre.</p>

      <Reorder.Group axis="y" values={items} onReorder={answered ? () => {} : setItems} className="space-y-2">
        {items.map((item, i) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className={cn(
              "flex items-start gap-3 p-3.5 border rounded-md cursor-grab active:cursor-grabbing select-none transition-all",
              !answered && "border-gray-200 bg-white hover:border-gray-300",
              isItemCorrect(item, i) && "border-emerald-300 bg-emerald-50 cursor-default",
              isItemWrong(item, i) && "border-red-200 bg-red-50 cursor-default",
            )}
          >
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {answered ? (
                isItemCorrect(item, i)
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <XCircle className="h-4 w-4 text-red-400" />
              ) : (
                <GripVertical className="h-4 w-4 text-gray-300" />
              )}
              <span className={cn(
                "h-5 w-5 rounded-sm flex items-center justify-center text-[11px] font-bold shrink-0",
                !answered && "bg-gray-100 text-gray-500",
                isItemCorrect(item, i) && "bg-emerald-500 text-white",
                isItemWrong(item, i) && "bg-red-400 text-white",
              )}>
                {i + 1}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
            {isItemWrong(item, i) && (
              <span className="shrink-0 text-[10px] text-red-500 font-semibold ml-auto">
                → pos. {item.correctPosition}
              </span>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!answered && (
        <button
          onClick={handleCheck}
          className="h-9 px-5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors"
        >
          Vérifier l&apos;ordre
        </button>
      )}

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-md p-3.5"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ordre correct</p>
          <div className="space-y-1">
            {[...exercise.items]
              .sort((a, b) => a.correctPosition - b.correctPosition)
              .map((item, i) => (
                <div key={item.id} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="font-bold text-gray-400 shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{item.text.slice(0, 80)}{item.text.length > 80 ? "…" : ""}</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
