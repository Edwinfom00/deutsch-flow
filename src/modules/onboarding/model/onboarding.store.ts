import { create } from "zustand";
import type { OnboardingData, OnboardingStep } from "../types";

interface OnboardingStore {
  step: OnboardingStep;
  data: OnboardingData;
  setStep: (step: OnboardingStep) => void;
  setData: (partial: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  data: { level: null, goal: null, sector: null, dailyGoalMinutes: null },
  setStep: (step) => set({ step }),
  setData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  next: () => set((s) => ({ step: Math.min(s.step + 1, 5) as OnboardingStep })),
  back: () => set((s) => ({ step: Math.max(s.step - 1, 1) as OnboardingStep })),
}));
