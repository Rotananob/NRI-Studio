import { create } from 'zustand';
import { Tab } from '../types/file.types';

interface EditorStore {
  tabs: Tab[];
  activeTabId: string | null;
  fontSize: number;
  theme: 'vs-dark' | 'light';

  openTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabClean: (tabId: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'vs-dark' | 'light') => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  fontSize: 14,
  theme: 'vs-dark',

  openTab: (tab) => {
    const existing = get().tabs.find(
      (t) => t.projectId === tab.projectId && t.filePath === tab.filePath
    );
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id }));
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter((t) => t.id !== tabId);
    let newActiveId = activeTabId;

    if (activeTabId === tabId) {
      const idx = tabs.findIndex((t) => t.id === tabId);
      newActiveId = newTabs[idx - 1]?.id ?? newTabs[0]?.id ?? null;
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateTabContent: (tabId, content) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, content, isDirty: true } : t
      ),
    })),

  markTabClean: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isDirty: false } : t
      ),
    })),

  setFontSize: (fontSize) => set({ fontSize }),
  setTheme: (theme) => set({ theme }),
}));
