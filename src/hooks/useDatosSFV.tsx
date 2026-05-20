import {
  createContext,
  useCallback,
  useContext,
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

/**
 * Stateless: los datos de planta viven SOLO en memoria React. Cualquier
 * remount completo (refresh, cerrar pestaña, ruta directa) los pierde.
 * No hay persistencia en localStorage. Contrato del MVP — ver
 * D-PROYECTO-02 (stateless) y disclaimer del Onboarding.
 */

type Estado = {
  datos: DatosSFV | null;
  warnings: Warning[];
  cargando: boolean;
  error: ErrorFormatoArchivo | null;
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
  limpiar: () => void;
};

const DatosSFVContext = createContext<DatosSFVContextValue | null>(null);

function useDatosSFVInterno(): DatosSFVContextValue {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);

  const cargar = useCallback(
    async (file: File, config: ConfiguracionPlanta) => {
      setEstado((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        const { datos, warnings } = await cargarArchivoSFV(file, config);
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

  const limpiar = useCallback(() => {
    setEstado(ESTADO_INICIAL);
  }, []);

  return {
    datos: estado.datos,
    warnings: estado.warnings,
    cargando: estado.cargando,
    error: estado.error,
    cargar,
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
