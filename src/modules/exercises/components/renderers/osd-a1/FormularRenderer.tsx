"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1Formular, OsdRendererProps } from "../../../types/osd-a1.types";

export function FormularRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1Formular>) {
  const [values, setValues] = useState<Record<string, string>>({});

  const setField = (id: string, val: string) => {
    if (answered) return;
    setValues((p) => ({ ...p, [id]: val }));
  };

  const handleSubmit = () => {
    if (answered) return;
    const filledRequired = exercise.fields.filter(
      (f) => f.required && (values[f.id] ?? "").trim().length > 0,
    ).length;
    const requiredCount = exercise.fields.filter((f) => f.required).length;
    const fillRate = requiredCount > 0 ? filledRequired / requiredCount : 1;

    let formatBonus = 0;
    const date = values["geburtsdatum"];
    if (date && /^\d{4}-\d{2}-\d{2}$|^\d{2}\.\d{2}\.\d{4}$/.test(date.trim())) formatBonus += 10;
    const plz = values["plz_ort"];
    if (plz && /\b\d{4,5}\b/.test(plz)) formatBonus += 10;

    const score = Math.min(100, Math.round(fillRate * 80 + formatBonus));
    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  const allRequiredFilled = exercise.fields
    .filter((f) => f.required)
    .every((f) => (values[f.id] ?? "").trim().length > 0);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-gray-300 rounded-md bg-white overflow-hidden"
      >
        <div className="bg-gray-900 px-5 py-3">
          <h3 className="text-white font-black text-base tracking-widest">
            {exercise.formularTitle}
          </h3>
        </div>

        <div className="p-5 space-y-4">
          {exercise.fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label
                htmlFor={field.id}
                className="block text-xs font-semibold text-gray-700"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.inputType === "text" && (
                <input
                  id={field.id}
                  type="text"
                  disabled={answered}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                  className="w-full h-10 px-3 border-b border-gray-300 bg-transparent text-sm text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              )}

              {field.inputType === "date" && (
                <input
                  id={field.id}
                  type="date"
                  disabled={answered}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                  className="w-full h-10 px-3 border-b border-gray-300 bg-transparent text-sm text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              )}

              {field.inputType === "radio" && field.options && (
                <div className="flex items-center gap-4 pt-1">
                  {field.options.map((opt) => (
                    <label
                      key={opt}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer text-sm text-gray-700",
                        answered && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        disabled={answered}
                        checked={values[field.id] === opt}
                        onChange={(e) => setField(field.id, e.target.value)}
                        className="h-4 w-4 accent-gray-900"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {field.inputType === "select" && field.options && (
                <select
                  id={field.id}
                  disabled={answered}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-60"
                >
                  <option value="">—</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 italic">
              (Ort und Datum) (Unterschrift)
            </p>
            {answered ? (
              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Formular ausgefüllt
              </span>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allRequiredFilled}
                className="h-9 px-5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
              >
                Anmeldung absenden
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
