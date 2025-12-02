import { useTranslation } from "react-i18next";
import { useToolboxStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Network, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function QueryHistory() {
  const { t } = useTranslation();
  const { history, removeHistory, clearHistory, setPendingQuery } = useToolboxStore();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    // 小于 1 小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 0 ? t("toolbox.justNow") : t("toolbox.minutesAgo", { count: minutes });
    }

    // 小于 24 小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return t("toolbox.hoursAgo", { count: hours });
    }

    // 今年内
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="w-48 border-r bg-muted/30 flex flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
        <p>{t("toolbox.noHistory")}</p>
      </div>
    );
  }

  return (
    <div className="w-48 border-r bg-muted/30 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("toolbox.history")}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={clearHistory}
          title={t("toolbox.clearHistory")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex items-start gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer",
                "hover:bg-muted transition-colors"
              )}
              onClick={() => setPendingQuery(item)}
            >
              {item.type === "whois" ? (
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              ) : (
                <Network className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" title={item.query}>
                  {item.query}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {item.type === "dns" && item.recordType && (
                    <>
                      <span className="text-primary">{item.recordType}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHistory(item.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
