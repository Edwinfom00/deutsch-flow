import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ExerciseResult } from "@/modules/exercises/components/ExerciseRenderer";

type SessionStatus = "idle" | "loading" | "playing" | "completed" | "error";

export interface SessionExercise {
  id: string;
  type: string;
  level: string;
  sector: string;
  skill: string;
  content: unknown;
  xpReward: number;
  difficultyScore: number;
}

export type PartialResult = ExerciseResult & { exerciseId: string };

interface SessionStore {
  status: SessionStatus;
  exercises: SessionExercise[];
  currentIndex: number;
  results: PartialResult[];
  error: string | null;

  setStatus: (s: SessionStatus) => void;
  setExercises: (ex: SessionExercise[], index?: number, results?: PartialResult[]) => void;
  setError: (e: string) => void;
  submitResult: (exerciseId: string, result: ExerciseResult) => void;
  next: () => void;
  reset: () => void;

  totalXpEarned: () => number;
  avgScore: () => number;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      status: "idle",
      exercises: [],
      currentIndex: 0,
      results: [],
      error: null,

      setStatus: (status) => set({ status }),

      setExercises: (exercises, index = 0, results = []) =>
        set({ exercises, currentIndex: index, results, status: "playing" }),

      setError: (error) => set({ error, status: "error" }),

      submitResult: (exerciseId, result) =>
        set((s) => ({ results: [...s.results, { ...result, exerciseId }] })),

      next: () => {
        const { currentIndex, exercises } = get();
        if (currentIndex + 1 >= exercises.length) {
          set({ status: "completed" });
        } else {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      reset: () => set({
        status: "idle",
        exercises: [],
        currentIndex: 0,
        results: [],
        error: null,
      }),

      totalXpEarned: () => {
        const { exercises, results } = get();
        const xpById = new Map(exercises.map((e) => [e.id, e.xpReward]));
        return results.reduce((sum, r) => {
          const xp = xpById.get(r.exerciseId) ?? 10;
          return sum + Math.round(xp * (r.score / 100));
        }, 0);
      },

      avgScore: () => {
        const { results } = get();
        if (!results.length) return 0;
        return Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
      },
    }),
    {
      name: "df-learn-session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      // On persiste uniquement les données essentielles, pas le status "loading"
      partialize: (state) => ({
        exercises: state.exercises,
        currentIndex: state.currentIndex,
        results: state.results,
        status: state.status === "loading" ? "idle" : state.status,
      }),
    }
  )
);
