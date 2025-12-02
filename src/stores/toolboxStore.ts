import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QueryHistoryItem } from "@/types";

const MAX_HISTORY_ITEMS = 50;

interface ToolboxState {
  history: QueryHistoryItem[];
  pendingQuery: QueryHistoryItem | null;
  addHistory: (item: Omit<QueryHistoryItem, "id" | "timestamp">) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  setPendingQuery: (item: QueryHistoryItem) => void;
  clearPendingQuery: () => void;
}

export const useToolboxStore = create<ToolboxState>()(
  persist(
    (set) => ({
      history: [],
      pendingQuery: null,

      addHistory: (item) =>
        set((state) => {
          const newItem: QueryHistoryItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          };

          // 检查是否已存在相同的查询
          const existingIndex = state.history.findIndex(
            (h) =>
              h.type === item.type &&
              h.query === item.query &&
              h.recordType === item.recordType
          );

          let newHistory: QueryHistoryItem[];

          if (existingIndex >= 0) {
            // 更新时间戳并移到最前面
            newHistory = [
              { ...state.history[existingIndex], timestamp: Date.now() },
              ...state.history.filter((_, i) => i !== existingIndex),
            ];
          } else {
            // 添加新记录到最前面
            newHistory = [newItem, ...state.history];
          }

          // 限制最大数量
          if (newHistory.length > MAX_HISTORY_ITEMS) {
            newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
          }

          return { history: newHistory };
        }),

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      clearHistory: () => set({ history: [] }),

      setPendingQuery: (item) => set({ pendingQuery: item }),

      clearPendingQuery: () => set({ pendingQuery: null }),
    }),
    {
      name: "toolbox-history",
      partialize: (state) => ({ history: state.history }),
    }
  )
);
