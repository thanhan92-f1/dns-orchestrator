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
              onClick: () => downloadAndInstall(),
            },
          });
        }
      } catch {
        // 静默失败，不打扰用户
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AppLayout />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
