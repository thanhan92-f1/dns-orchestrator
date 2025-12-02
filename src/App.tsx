import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { initTheme } from "@/stores";
import { useUpdaterStore } from "@/stores/updaterStore";

function App() {
  const { t } = useTranslation();
  const { checkForUpdates, downloadAndInstall } = useUpdaterStore();

  useEffect(() => {
    initTheme();

    // 启动后延迟 3 秒检查更新
    const timer = setTimeout(async () => {
      try {
        const update = await checkForUpdates();
        if (update) {
          toast.info(t("settings.updateAvailable"), {
            description: t("settings.updateAvailableDesc", { version: update.version }),
            duration: 10000,
            action: {
              label: t("settings.updateNow"),
              onClick: () => {
                downloadAndInstall().catch((error) => {
                  const errorMsg = error instanceof Error ? error.message : String(error);
                  toast.error(t("settings.downloadFailed"), {
                    description: t("settings.downloadFailedDesc", { error: errorMsg }),
                  });
                });
              },
            },
          });
        }
      } catch (error) {
        // 启动时的错误检查不打扰用户，仅记录日志
        console.error("Update check failed:", error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkForUpdates, downloadAndInstall, t]);

  return (
    <>
      <AppLayout />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
