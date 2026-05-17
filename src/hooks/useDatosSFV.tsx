import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { cargarArchivoSFV } from "@/lib/io/excel-loader";
import {
  ErrorFormatoArchivo,
  type ConfiguracionPlanta,
  type DatosSFV,
  type Warning,
} from "@/types/sfv";

const STORAGE_KEY = "dimensionamiento-bess:datos-sfv";

type Estado = {
  datos: DatosSFV | null;
  warnings: Warning[];
  cargando: boolean;
  error: ErrorFormatoArchivo | null;
};

type Persistido = {
  datos: DatosSFV;
  warnings: Warning[];
};

const ESTADO_INICIAL: Estado = {
  datos: null,
  warnings: [],
  cargando: false,
  error: null,
};

type DatosSFVContextValue = {
  datos: DatosSFV | null;
  warnings: Warning[];
  cargando: boolean;
  error: ErrorFormatoArchivo | null;
  cargar: (file: File, config: ConfiguracionPlanta) => Promise<void>;
  rehidratar: () => void;
  limpiar: () => void;
};

const DatosSFVContext = createContext<DatosSFVContextValue | null>(null);

function useDatosSFVInterno(): DatosSFVContextValue {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);

  useEffect(() => {
    const persistido = leerLocalStorage();
    if (persistido) {
      setEstado({
        datos: persistido.datos,
        warnings: persistido.warnings,
        cargando: false,
        error: null,
      });
    }
  }, []);

  const cargar = useCallback(
    async (file: File, config: ConfiguracionPlanta) => {
      setEstado((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        const { datos, warnings } = await cargarArchivoSFV(file, config);
        escribirLocalStorage({ datos, warnings });
        setEstado({ datos, warnings, cargando: false, error: null });
      } catch (err) {
        const error =
          err instanceof ErrorFormatoArchivo
            ? err
            : new ErrorFormatoArchivo(
                "No se pudo procesar el archivo.",
                err instanceof Error ? err.message : undefined
              );
        setEstado((prev) => ({
          ...prev,
          cargando: false,
          error,
        }));
      }
    },
    []
  );

  const rehidratar = useCallback(() => {
    const persistido = leerLocalStorage();
    if (persistido) {
      setEstado({
        datos: persistido.datos,
        warnings: persistido.warnings,
        cargando: false,
        error: null,
      });
    }
  }, []);

  const limpiar = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage no disponible
    }
    setEstado(ESTADO_INICIAL);
  }, []);

  return {
    datos: estado.datos,
    warnings: estado.warnings,
    cargando: estado.cargando,
    error: estado.error,
    cargar,
    rehidratar,
    limpiar,
  };
}

export function DatosSFVProvider({ children }: { children: ReactNode }) {
  const valor = useDatosSFVInterno();
  return (
    <DatosSFVContext.Provider value={valor}>{children}</DatosSFVContext.Provider>
  );
}

export function useDatosSFV(): DatosSFVContextValue {
  const ctx = useContext(DatosSFVContext);
  if (!ctx) {
    throw new Error("useDatosSFV debe usarse dentro de <DatosSFVProvider>.");
  }
  return ctx;
}

function leerLocalStorage(): Persistido | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      datos: {
        config: ConfiguracionPlanta;
        registros: Array<{
          timestamp: string;
          energia_mwh: number;
          potencia_kw_prom: number;
        }>;
        meta: DatosSFV["meta"];
      };
      warnings: Warning[];
    };
    const registros = parsed.datos.registros.map((r) => ({
      timestamp: new Date(r.timestamp),
      energia_mwh: r.energia_mwh,
      potencia_kw_prom: r.potencia_kw_prom,
    }));
    return {
      datos: {
        config: parsed.datos.config,
        registros,
        meta: parsed.datos.meta,
      },
      warnings: parsed.warnings,
    };
  } catch {
    return null;
  }
}

function escribirLocalStorage(p: Persistido) {
  try {
    const payload = {
      datos: {
        config: p.datos.config,
        registros: p.datos.registros.map((r) => ({
          timestamp: r.timestamp.toISOString(),
          energia_mwh: r.energia_mwh,
          potencia_kw_prom: r.potencia_kw_prom,
        })),
        meta: p.datos.meta,
      },
      warnings: p.warnings,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage no disponible o cuota excedida
  }
}
