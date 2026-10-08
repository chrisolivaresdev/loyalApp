import { create } from 'zustand';

export type DownloadAction = 'share' | 'save' | null;

interface DownloadDialogState {
  fileName: string | null;
  /** true mientras se descarga/escribe el archivo tras elegir la acción */
  busy: boolean;
  resolve: ((action: DownloadAction) => void) | null;
  /** Muestra el diálogo y resuelve con la acción elegida (null = cancelar). */
  ask: (fileName: string) => Promise<DownloadAction>;
  /** 'share'/'save' mantienen el diálogo abierto con spinner hasta done(). */
  answer: (action: DownloadAction) => void;
  done: () => void;
}

export const useDownloadDialogStore = create<DownloadDialogState>((set, get) => ({
  fileName: null,
  busy: false,
  resolve: null,
  ask: (fileName) =>
    new Promise<DownloadAction>((resolve) => {
      get().resolve?.(null);
      set({ fileName, resolve, busy: false });
    }),
  answer: (action) => {
    const resolve = get().resolve;
    if (!resolve || get().busy) return;
    if (action === null) {
      resolve(null);
      set({ fileName: null, resolve: null, busy: false });
    } else {
      resolve(action);
      set({ busy: true });
    }
  },
  done: () => set({ fileName: null, resolve: null, busy: false }),
}));
