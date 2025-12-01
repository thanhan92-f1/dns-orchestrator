import { create } from "zustand";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdaterState {
  checking: boolean;
  downloading: boolean;
  progress: number;
  available: Update | null;
  error: string | null;
  checkForUpdates: () => Promise<Update | null>;
  downloadAndInstall: () => Promise<void>;
  reset: () => void;
}

export const useUpdaterStore = create<UpdaterState>((set, get) => ({
  checking: false,
  downloading: false,
  progress: 0,
  available: null,
  error: null,

  checkForUpdates: async () => {
    set({ checking: true, error: null });
    try {
      const update = await check();
      set({ available: update, checking: false });
      return update;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      set({ error: errorMessage, checking: false });
      return null;
    }
  },

  downloadAndInstall: async () => {
    const { available } = get();
    if (!available) return;

    set({ downloading: true, progress: 0, error: null });

    try {
      let downloaded = 0;
      let contentLength = 0;

      await available.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              set({ progress: Math.round((downloaded / contentLength) * 100) });
            }
            break;
          case "Finished":
            set({ progress: 100 });
            break;
        }
      });

      // 安装完成后重启应用
      await relaunch();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      set({ error: errorMessage, downloading: false });
    }
  },

  reset: () => {
    set({
      checking: false,
      downloading: false,
      progress: 0,
      available: null,
      error: null,
    });
  },
}));
