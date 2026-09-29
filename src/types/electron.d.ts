export interface ElectronAPI {
  isElectron: boolean;
  savePDF: (options?: { defaultFileName?: string; title?: string; landscape?: boolean }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  previewPDF: (options?: { title?: string; landscape?: boolean }) => Promise<{ success: boolean; tempFilePath?: string; error?: string }>;
  print: () => Promise<boolean>;
  openPath: (targetPath: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
