import { useTranslation } from "react-i18next";
import { useToolboxStore } from "@/stores";
import { X } from "lucide-react";
import type { QueryHistoryItem } from "@/types";

interface HistoryChipsProps {
  type: "whois" | "dns";
  onSelect: (item: QueryHistoryItem) => void;
  maxItems?: number;
}

export function HistoryChips({ type, onSelect, maxItems = 5 }: HistoryChipsProps) {
  const { t } = useTranslation();
  const { history, removeHistory, clearHistory } = useToolboxStore();

  // 过滤并限制数量
  const filteredHistory = history
    .filter((item) => item.type === type)
    .slice(0, maxItems);

  if (filteredHistory.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground shrink-0">
        {t("toolbox.history")}:
      </span>
      {filteredHistory.map((item) => (
        <button
          key={item.id}
          className="group inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
          onClick={() => onSelect(item)}
        >
          {item.type === "dns" && item.recordType && (
            <span className="text-primary font-medium">{item.recordType}</span>
          )}
          <span className="max-w-32 truncate">{item.query}</span>
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeHistory(item.id);
            }}
          >
            <X className="h-3 w-3" />
          </span>
        </button>
      ))}
      {history.filter((item) => item.type === type).length > maxItems && (
        <button
          className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => clearHistory()}
          title={t("toolbox.clearHistory")}
        >
          {t("toolbox.clearHistory")}
        </button>
      )}
    </div>
  );
}
