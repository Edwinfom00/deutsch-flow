"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useOnboardingStore } from "../model/onboarding.store";
import { StepLevel } from "./StepLevel";
import { StepGoal } from "./StepGoal";
import { StepSector } from "./StepSector";
import { StepRythme } from "./StepRythme";
import { StepRecap } from "./StepRecap";

const TOTAL_STEPS = 4; // step 5 = recap, pas compté dans la barre

const stepComponents = {
  1: StepLevel,
  2: StepGoal,
  3: StepSector,
  4: StepRythme,
  5: StepRecap,
} as const;

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export function OnboardingWizard() {
  const { step, back } = useOnboardingStore();
  const StepComponent = stepComponents[step];
  const progress = Math.min((step - 1) / TOTAL_STEPS, 1);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="px-5 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-[10px] font-heading">DF</span>
            </div>
            <span className="font-bold text-sm font-heading text-gray-900">DeutschFlow</span>
          </div>

          {/* Back button */}
          {step > 1 && step < 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={back}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </motion.button>
          )}
        </div>

        {/* Progress bar */}
        {step < 5 && (
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-full"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-5 pt-4 pb-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
