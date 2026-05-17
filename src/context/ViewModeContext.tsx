import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ViewMode = "cliente" | "tecnico";

const STORAGE_KEY = "dimensionamiento-bess:viewMode";
const DEFAULT_MODE: ViewMode = "cliente";

interface ViewModeContextValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

function readInitialMode(): ViewMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "tecnico" || stored === "cliente"
      ? stored
      : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage no disponible; el estado en memoria sigue funcionando.
    }
  }, [mode]);

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
  }, []);

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode debe usarse dentro de <ViewModeProvider>.");
  }
  return ctx;
}
