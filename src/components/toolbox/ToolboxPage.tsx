import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Wrench } from "lucide-react";
import { WhoisLookup } from "./WhoisLookup";
import { DnsLookup } from "./DnsLookup";
import { QueryHistory } from "./QueryHistory";

interface ToolboxPageProps {
  onBack: () => void;
}

export function ToolboxPage({ onBack }: ToolboxPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("toolbox.title")}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧历史记录 */}
        <QueryHistory />

        {/* 右侧主内容 */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <WhoisLookup />
            <DnsLookup />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
