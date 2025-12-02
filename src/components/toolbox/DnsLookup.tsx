import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useToolboxStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";
import type { ApiResponse, DnsLookupRecord, DnsLookupType } from "@/types";
import { DNS_RECORD_TYPES } from "@/types";

export function DnsLookup() {
  const { t } = useTranslation();
  const { addHistory, pendingQuery, clearPendingQuery } = useToolboxStore();
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<DnsLookupType>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DnsLookupRecord[]>([]);
  const shouldTriggerLookup = useRef(false);

  // 监听历史记录点击
  useEffect(() => {
    if (pendingQuery && pendingQuery.type === "dns") {
      setDomain(pendingQuery.query);
      if (pendingQuery.recordType) {
        setRecordType(pendingQuery.recordType as DnsLookupType);
      }
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
    setResults([]);

    try {
      const response = await invoke<ApiResponse<DnsLookupRecord[]>>(
        "dns_lookup",
        {
          domain: domain.trim(),
          recordType,
        }
      );

      if (response.success && response.data) {
        setResults(response.data);
        addHistory({
          type: "dns",
          query: domain.trim(),
          recordType,
        });

        if (response.data.length === 0) {
          toast.info(t("toolbox.noRecords"));
        }
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
        <CardTitle className="text-lg">{t("toolbox.dnsLookup")}</CardTitle>
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
            className="flex-1"
          />
          <Select
            value={recordType}
            onValueChange={(v) => setRecordType(v as DnsLookupType)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {DNS_RECORD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {results.length > 0 && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">{t("common.type")}</TableHead>
                  <TableHead>{t("dns.name")}</TableHead>
                  <TableHead>{t("dns.value")}</TableHead>
                  <TableHead className="w-20">{t("dns.ttl")}</TableHead>
                  <TableHead className="w-20">{t("dns.priority")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                        {record.recordType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-48">
                      {record.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-0">
                      <div
                        className="truncate cursor-pointer hover:underline"
                        title={record.value}
                        onClick={() => {
                          navigator.clipboard.writeText(record.value);
                          toast.success(t("common.copied"));
                        }}
                      >
                        {record.value}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.ttl}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.priority ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
