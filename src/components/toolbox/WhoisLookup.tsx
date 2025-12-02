import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useToolboxStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import type { ApiResponse, WhoisResult } from "@/types";

export function WhoisLookup() {
  const { t } = useTranslation();
  const { addHistory, pendingQuery, clearPendingQuery } = useToolboxStore();
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const shouldTriggerLookup = useRef(false);

  // 监听历史记录点击
  useEffect(() => {
    if (pendingQuery && pendingQuery.type === "whois") {
      setDomain(pendingQuery.query);
      shouldTriggerLookup.current = true;
      clearPendingQuery();
    }
  }, [pendingQuery, clearPendingQuery]);

  // domain 变化后触发查询
  useEffect(() => {
    if (shouldTriggerLookup.current && domain) {
      shouldTriggerLookup.current = false;
      handleLookup();
    }
  }, [domain]);

  const handleLookup = async () => {
    if (!domain.trim()) {
      toast.error(t("toolbox.enterDomain"));
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await invoke<ApiResponse<WhoisResult>>("whois_lookup", {
        domain: domain.trim(),
      });

      if (response.success && response.data) {
        setResult(response.data);
        addHistory({ type: "whois", query: domain.trim() });
      } else {
        toast.error(response.error?.message || t("toolbox.queryFailed"));
      }
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("toolbox.whoisLookup")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 查询输入 */}
        <div className="flex gap-2">
          <Input
            placeholder={t("toolbox.domainPlaceholder")}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button onClick={handleLookup} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">{t("toolbox.query")}</span>
          </Button>
        </div>

        {/* 查询结果 */}
        {result && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("toolbox.whois.domain")}:</span>
                <span className="ml-2 font-medium">{result.domain}</span>
              </div>
              {result.registrar && (
                <div>
                  <span className="text-muted-foreground">{t("toolbox.whois.registrar")}:</span>
                  <span className="ml-2">{result.registrar}</span>
                </div>
              )}
              {result.creationDate && (
                <div>
                  <span className="text-muted-foreground">{t("toolbox.whois.creationDate")}:</span>
                  <span className="ml-2">{result.creationDate}</span>
                </div>
              )}
              {result.expirationDate && (
                <div>
                  <span className="text-muted-foreground">{t("toolbox.whois.expirationDate")}:</span>
                  <span className="ml-2">{result.expirationDate}</span>
                </div>
              )}
              {result.updatedDate && (
                <div>
                  <span className="text-muted-foreground">{t("toolbox.whois.updatedDate")}:</span>
                  <span className="ml-2">{result.updatedDate}</span>
                </div>
              )}
            </div>

            {result.nameServers.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("toolbox.whois.nameServers")}:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.nameServers.map((ns, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-muted rounded text-xs font-mono"
                    >
                      {ns}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.status.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("toolbox.whois.status")}:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.status.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-muted rounded text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.raw && (
              <div className="text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto text-muted-foreground hover:text-foreground"
                  onClick={() => setShowRaw(!showRaw)}
                >
                  {showRaw ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {t("toolbox.whois.rawData")}
                </Button>
                {showRaw && (
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-64 font-mono whitespace-pre-wrap">
                    {result.raw}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
