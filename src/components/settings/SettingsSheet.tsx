import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { toast } from "sonner";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUpdaterStore } from "@/stores/updaterStore";
import { supportedLanguages, type LanguageCode } from "@/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor, Languages, RefreshCw, Download, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { t } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useSettingsStore();
  const { checking, downloading, progress, available, upToDate, error, isPlatformUnsupported, checkForUpdates, downloadAndInstall, skipVersion, resetUpToDate } = useUpdaterStore();

  // 每次打开设置页面时，重置 upToDate 状态，允许用户再次检查更新
  useEffect(() => {
    if (open) {
      resetUpToDate();
    }
  }, [open, resetUpToDate]);

  // 跳过版本处理
  const handleSkipVersion = () => {
    if (available) {
      skipVersion();
      toast.success(t("settings.versionSkipped", { version: available.version }));
    }
  };

  // 手动检查更新处理
  const handleCheckUpdates = async () => {
    try {
      const update = await checkForUpdates();
      // 如果有错误（平台不支持），显示错误提示
      if (!update) {
        const { error: checkError, isPlatformUnsupported: platformError } = useUpdaterStore.getState();
        if (checkError) {
          if (platformError) {
            toast.error(t("settings.platformNotSupported"), {
              description: t("settings.platformNotSupportedDesc"),
              action: {
                label: "GitHub Releases",
                onClick: async () => {
                  try {
                    await openUrl("https://github.com/AptS-1547/dns-orchestrator/releases/latest");
                  } catch (err) {
                    console.error("Failed to open URL:", err);
                  }
                },
              },
            });
          } else {
            toast.error(t("settings.updateCheckError"), {
              description: t("settings.updateCheckErrorDesc", { error: checkError }),
            });
          }
        }
      }
    } catch (error) {
      // 异常情况
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(t("settings.updateCheckError"), {
        description: t("settings.updateCheckErrorDesc", { error: errorMsg }),
      });
    }
  };

  // 下载并安装处理
  const handleDownloadAndInstall = async () => {
    try {
      await downloadAndInstall();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(t("settings.downloadFailed"), {
        description: t("settings.downloadFailedDesc", { error: errorMsg }),
      });
    }
  };

  const themes = [
    { id: "light" as const, label: t("settings.themeLight"), icon: Sun },
    { id: "dark" as const, label: t("settings.themeDark"), icon: Moon },
    { id: "system" as const, label: t("settings.themeSystem"), icon: Monitor },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("settings.title")}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
          {/* 主题设置 */}
          <div className="space-y-4">
            <Label className="text-base">{t("settings.appearance")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                    theme === id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 语言设置 */}
          <div className="space-y-4">
            <Label className="text-base">{t("settings.language")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as LanguageCode)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                    language === lang.code
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 通知设置 */}
          <div className="space-y-4">
            <Label className="text-base">{t("settings.notifications")}</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-sm font-normal">
                  {t("settings.operationNotifications")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.operationNotificationsDesc")}
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </div>

          <Separator />

          {/* 关于 */}
          <div className="space-y-3">
            <Label className="text-base">{t("settings.about")}</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t("common.appName")}</p>
              <p>{t("settings.version")} {__APP_VERSION__}</p>
            </div>

            {/* 检查更新 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {available ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleDownloadAndInstall}
                      disabled={downloading}
                      className="gap-2"
                    >
                      {downloading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          {t("settings.downloading")} {progress}%
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          {t("settings.updateNow")} ({available.version})
                        </>
                      )}
                    </Button>
                    {!downloading && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkipVersion}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        {t("settings.skipVersion")}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant={upToDate ? "default" : "outline"}
                    size="sm"
                    onClick={handleCheckUpdates}
                    disabled={checking || upToDate}
                    className="gap-2"
                  >
                    {checking ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {t("settings.checking")}
                      </>
                    ) : upToDate ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t("settings.noUpdate")}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t("settings.checkUpdate")}
                      </>
                    )}
                  </Button>
                )}
              </div>
              {/* 错误提示 */}
              {error && (
                <p className="text-xs text-destructive">
                  {isPlatformUnsupported
                    ? t("settings.platformNotSupported")
                    : t("settings.updateCheckError")}
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
