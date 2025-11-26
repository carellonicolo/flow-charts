import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../styles/theme';

/**
 * Stato dei modals
 */
interface ModalsState {
  nodeEdit: { isOpen: boolean; nodeId: string | null };
  input: { isOpen: boolean; variable: string | null };
  export: { isOpen: boolean };
  examples: { isOpen: boolean };
  settings: { isOpen: boolean };
  tutorial: { isOpen: boolean };
}

/**
 * Store Zustand per gestione UI
 * Persiste in localStorage
 */
interface UIStore {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Modals
  modals: ModalsState;
  openModal: (modal: keyof ModalsState, data?: any) => void;
  closeModal: (modal: keyof ModalsState) => void;
  closeAllModals: () => void;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Toolbar
  isToolbarVisible: boolean;
  toggleToolbar: () => void;
  setToolbarVisible: (visible: boolean) => void;

  // Tutorial
  isTutorialCompleted: boolean;
  currentTutorialStep: number;
  setTutorialCompleted: (completed: boolean) => void;
  setTutorialStep: (step: number) => void;
  resetTutorial: () => void;

  // Autosave
  isAutosaveEnabled: boolean;
  lastSaveTime: number | null;
  toggleAutosave: () => void;
  setLastSaveTime: (time: number) => void;

  // Validazione
  showValidationPanel: boolean;
  toggleValidationPanel: () => void;

  // Mobile
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;

  // Loading
  isLoading: boolean;
  loadingMessage: string | null;
  setLoading: (loading: boolean, message?: string) => void;

  // Notifications
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: () => void;
}

/**
 * Stato iniziale dei modals
 */
const initialModalsState: ModalsState = {
  nodeEdit: { isOpen: false, nodeId: null },
  input: { isOpen: false, variable: null },
  export: { isOpen: false },
  examples: { isOpen: false },
  settings: { isOpen: false },
  tutorial: { isOpen: false },
};

/**
 * Hook Zustand per UI store (con persist)
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // === THEME ===

      theme: 'light',

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });

        // Applica classe sul documento
        if (typeof window !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      setTheme: (theme) => {
        set({ theme });

        // Applica classe sul documento
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      // === MODALS ===

      modals: initialModalsState,

      openModal: (modal, data) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: { isOpen: true, ...data },
          },
        }));
      },

      closeModal: (modal) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: { ...state.modals[modal], isOpen: false },
          },
        }));
      },

      closeAllModals: () => {
        set({ modals: initialModalsState });
      },

      // === SIDEBAR ===

      isSidebarCollapsed: false,

      toggleSidebar: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ isSidebarCollapsed: collapsed });
      },

      // === TOOLBAR ===

      isToolbarVisible: true,

      toggleToolbar: () => {
        set((state) => ({ isToolbarVisible: !state.isToolbarVisible }));
      },

      setToolbarVisible: (visible) => {
        set({ isToolbarVisible: visible });
      },

      // === TUTORIAL ===

      isTutorialCompleted: false,
      currentTutorialStep: 0,

      setTutorialCompleted: (completed) => {
        set({ isTutorialCompleted: completed });
      },

      setTutorialStep: (step) => {
        set({ currentTutorialStep: step });
      },

      resetTutorial: () => {
        set({ isTutorialCompleted: false, currentTutorialStep: 0 });
      },

      // === AUTOSAVE ===

      isAutosaveEnabled: true,
      lastSaveTime: null,

      toggleAutosave: () => {
        set((state) => ({ isAutosaveEnabled: !state.isAutosaveEnabled }));
      },

      setLastSaveTime: (time) => {
        set({ lastSaveTime: time });
      },

      // === VALIDATION ===

      showValidationPanel: true,

      toggleValidationPanel: () => {
        set((state) => ({ showValidationPanel: !state.showValidationPanel }));
      },

      // === MOBILE ===

      isMobileMenuOpen: false,

      toggleMobileMenu: () => {
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
      },

      // === LOADING ===

      isLoading: false,
      loadingMessage: null,

      setLoading: (loading, message) => {
        set({ isLoading: loading, loadingMessage: message || null });
      },

      // === NOTIFICATIONS ===

      notification: null,

      showNotification: (message, type) => {
        set({ notification: { message, type } });

        // Auto-clear dopo 5 secondi
        setTimeout(() => {
          get().clearNotification();
        }, 5000);
      },

      clearNotification: () => {
        set({ notification: null });
      },
    }),
    {
      name: 'flowchart-ui-storage', // localStorage key
      partialize: (state) => ({
        // Persiste solo questi campi
        theme: state.theme,
        isTutorialCompleted: state.isTutorialCompleted,
        isAutosaveEnabled: state.isAutosaveEnabled,
        isSidebarCollapsed: state.isSidebarCollapsed,
        showValidationPanel: state.showValidationPanel,
      }),
    }
  )
);

/**
 * Hook per inizializzare il tema all'avvio
 */
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;

  const store = useUIStore.getState();
  const theme = store.theme;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
