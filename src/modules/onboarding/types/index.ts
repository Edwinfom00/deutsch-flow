import type { CEFRLevel, Sector, Goal } from "@/types";

export interface OnboardingData {
  level: CEFRLevel | null;
  goal: Goal | null;
  sector: Sector | null;
  dailyGoalMinutes: number | null;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;
