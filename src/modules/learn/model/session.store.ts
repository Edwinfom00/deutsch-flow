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
        set((s) => ({
          results: [...(Array.isArray(s.results) ? s.results : []), { ...result, exerciseId }],
        })),

      next: () => {
        const { currentIndex, exercises } = get();
        const safeExercises = Array.isArray(exercises) ? exercises : [];
        if (currentIndex + 1 >= safeExercises.length) {
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
        const safeExercises = Array.isArray(exercises) ? exercises : [];
        const safeResults = Array.isArray(results) ? results : [];
        const xpById = new Map(safeExercises.map((e) => [e.id, e.xpReward]));
        return safeResults.reduce((sum, r) => {
          const xp = xpById.get(r.exerciseId) ?? 10;
          return sum + Math.round(xp * (r.score / 100));
        }, 0);
      },

      avgScore: () => {
        const { results } = get();
        const safeResults = Array.isArray(results) ? results : [];
        if (!safeResults.length) return 0;
        return Math.round(safeResults.reduce((s, r) => s + r.score, 0) / safeResults.length);
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
        exercises: Array.isArray(state.exercises) ? state.exercises : [],
        currentIndex: typeof state.currentIndex === "number" ? state.currentIndex : 0,
        results: Array.isArray(state.results) ? state.results : [],
        status: state.status === "loading" ? "idle" : state.status,
      }),
      // Reset automatique si l'état restauré est corrompu
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!Array.isArray(state.exercises)) state.exercises = [];
        if (!Array.isArray(state.results)) state.results = [];
        if (typeof state.currentIndex !== "number") state.currentIndex = 0;
        // Si currentIndex dépasse la longueur du tableau, reset
        if (state.currentIndex >= state.exercises.length && state.exercises.length > 0) {
          state.currentIndex = 0;
          state.status = "idle";
        }
      },
    }
  )
);
