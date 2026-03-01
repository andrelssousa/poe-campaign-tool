// store/useAppStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "pt-BR";

type ProgressSnapshot = {
  completedCount: number;
  xpEarned: number;
  level: number;
  updatedAt: number; // unix ms
};

type StoreState = {
  // hydration
  hasHydrated: boolean;
  setHasHydrated: () => void;

  // user prefs
  selectedClass: string;
  setSelectedClass: (cls: string) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  // filters
  showUncompletedOnly: boolean;
  toggleShowUncompletedOnly: () => void;

  // progress
  completedQuestIds: Record<string, boolean>;
  isQuestCompleted: (questId: string) => boolean;
  toggleQuestCompleted: (questId: string) => void;

  // snapshot (for “since last visit”)
  progressSnapshot: ProgressSnapshot | null;
  setProgressSnapshot: (snap: ProgressSnapshot) => void;
  clearProgressSnapshot: () => void;

  resetProgress: () => void;
};

function sameSnapshot(a: ProgressSnapshot | null, b: ProgressSnapshot | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  // IMPORTANT: ignore updatedAt for equality checks (it changes constantly)
  return (
    a.completedCount === b.completedCount &&
    a.xpEarned === b.xpEarned &&
    a.level === b.level
  );
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // hydration
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),

      // prefs
      selectedClass: "Ranger",
      setSelectedClass: (cls) => set({ selectedClass: cls }),

      language: "pt-BR",
      setLanguage: (lang) => set({ language: lang }),

      // filters
      showUncompletedOnly: false,
      toggleShowUncompletedOnly: () =>
        set({ showUncompletedOnly: !get().showUncompletedOnly }),

      // progress
      completedQuestIds: {},
      isQuestCompleted: (questId) => !!get().completedQuestIds[questId],
      toggleQuestCompleted: (questId) => {
        const current = get().completedQuestIds;
        const next = { ...current, [questId]: !current[questId] };
        set({ completedQuestIds: next });
      },

      // snapshot
      progressSnapshot: null,
      setProgressSnapshot: (snap) =>
        set((state) => {
          if (sameSnapshot(state.progressSnapshot, snap)) return state;
          // store updatedAt too, but don't use it to decide "changed"
          return { progressSnapshot: snap };
        }),
      clearProgressSnapshot: () => set({ progressSnapshot: null }),

      resetProgress: () =>
        set({
          completedQuestIds: {},
          showUncompletedOnly: false,
          progressSnapshot: null,
        }),
    }),
    {
      name: "poe-awesome-tool",
      version: 2,
      partialize: (state) => ({
        selectedClass: state.selectedClass,
        language: state.language,
        showUncompletedOnly: state.showUncompletedOnly,
        completedQuestIds: state.completedQuestIds,
        progressSnapshot: state.progressSnapshot,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);