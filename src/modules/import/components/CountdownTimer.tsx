"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  seconds: number;          // durée totale en secondes
  onExpire: () => void;     // appelé quand le timer atteint 0
}

export function useCountdown(totalSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expiredRef.current = false;
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const pct = Math.max(0, (remaining / totalSeconds) * 100);
  const isRed = remaining <= 60;
  const isCritical = remaining <= 5;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const label = `${minutes}:${String(secs).padStart(2, "0")}`;

  return { remaining, pct, isRed, isCritical, label };
}

export function CountdownTimer({ seconds, onExpire }: Props) {
  const { remaining, pct, isRed, isCritical, label } = useCountdown(seconds, onExpire);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Icône */}
      <motion.div
        animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4, repeat: isCritical ? Infinity : 0 }}
      >
        {isRed
          ? <AlertTriangle className={cn("h-3.5 w-3.5", isCritical ? "text-red-500" : "text-orange-400")} />
          : <Clock className="h-3.5 w-3.5 text-gray-400" />
        }
      </motion.div>

      {/* Label */}
      <motion.span
        key={isCritical ? "critical" : isRed ? "red" : "normal"}
        initial={{ scale: 1 }}
        animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3, repeat: isCritical ? Infinity : 0 }}
        className={cn(
          "text-xs font-mono font-bold tabular-nums",
          isCritical ? "text-red-500" : isRed ? "text-orange-400" : "text-gray-400"
        )}
      >
        {label}
      </motion.span>

      {/* Barre */}
      <div className="w-16 h-1 bg-gray-100 rounded-sm overflow-hidden">
        <motion.div
          className={cn("h-full rounded-sm transition-colors duration-1000",
            isCritical ? "bg-red-500" : isRed ? "bg-orange-400" : "bg-gray-400"
          )}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Alerte 5s */}
      <AnimatePresence>
        {isCritical && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm"
          >
            {remaining}s
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
