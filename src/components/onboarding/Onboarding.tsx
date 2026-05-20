import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import type { ConfiguracionPlanta } from "@/types/sfv";
import { ErrorFormatoArchivo } from "@/types/sfv";
import { SeccionDatosCliente } from "@/components/onboarding/SeccionDatosCliente";
import { SeccionParametrosContractuales } from "@/components/onboarding/SeccionParametrosContractuales";
import { SeccionArchivoGeneracion } from "@/components/onboarding/SeccionArchivoGeneracion";

type EstadoFormulario = {
  nombre: string;
  cliente: string;
  ubicacion: string;
  capacidad_poi_kw: number | null;
  capacidad_instalada_kw: number | null;
  zona_lmp: string;
  precio_ppa_mxn_mwh: number | null;
};

const ESTADO_INICIAL: EstadoFormulario = {
  nombre: "",
  cliente: "",
  ubicacion: "",
  capacidad_poi_kw: null,
  capacidad_instalada_kw: null,
  zona_lmp: "",
  precio_ppa_mxn_mwh: null,
};

interface Props {
  cargando: boolean;
  error: ErrorFormatoArchivo | null;
  cargar: (file: File, config: ConfiguracionPlanta) => Promise<void>;
}

export function Onboarding({ cargando, error, cargar }: Props) {
  const [estado, setEstado] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const [archivo, setArchivo] = useState<File | null>(null);

  const actualizar = (parcial: Partial<EstadoFormulario>) => {
    setEstado((prev) => ({ ...prev, ...parcial }));
  };

  const errorPrecioPpa =
    estado.precio_ppa_mxn_mwh !== null &&
    (!Number.isFinite(estado.precio_ppa_mxn_mwh) ||
      estado.precio_ppa_mxn_mwh <= 0)
      ? "El precio debe ser mayor a cero."
      : null;

  const formularioValido =
    estado.nombre.trim().length > 0 &&
    estado.capacidad_poi_kw !== null &&
    estado.capacidad_poi_kw > 0 &&
    estado.capacidad_instalada_kw !== null &&
    estado.capacidad_instalada_kw > 0 &&
    archivo !== null &&
    errorPrecioPpa === null;

  const puedeProcesar = formularioValido && !cargando;

  const procesar = async () => {
    if (!archivo) return;
    if (
      estado.capacidad_poi_kw === null ||
      estado.capacidad_instalada_kw === null
    ) {
      return;
    }
    const config: ConfiguracionPlanta = {
      nombre: estado.nombre.trim(),
      cliente: estado.cliente.trim() || null,
      ubicacion: estado.ubicacion.trim() || null,
      capacidad_poi_kw: estado.capacidad_poi_kw,
      capacidad_instalada_kw: estado.capacidad_instalada_kw,
      zona_lmp: estado.zona_lmp.trim() || null,
      precio_ppa_mxn_mwh: estado.precio_ppa_mxn_mwh,
    };
    await cargar(archivo, config);
  };

  return (
    <div className="mx-auto max-w-[1080px] space-y-6 px-10 pb-16 pt-8">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-ink-primary">
          {COPY_M1A.hero.titulo}
        </h1>
      </header>

      <div
        className="flex items-start gap-2 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[12px] leading-relaxed text-[#1E40AF]"
        role="status"
      >
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>
          El análisis vive solo durante esta sesión. Si refrescas o abres
          una nueva pestaña, deberás cargar el archivo nuevamente.
        </span>
      </div>

      <div className="space-y-5">
        <SeccionDatosCliente
          nombre={estado.nombre}
          cliente={estado.cliente}
          ubicacion={estado.ubicacion}
          onChange={actualizar}
        />
        <SeccionParametrosContractuales
          capacidad_poi_kw={estado.capacidad_poi_kw}
          capacidad_instalada_kw={estado.capacidad_instalada_kw}
          zona_lmp={estado.zona_lmp}
          precio_ppa_mxn_mwh={estado.precio_ppa_mxn_mwh}
          errorPrecioPpa={errorPrecioPpa}
          onChange={actualizar}
        />
        <SeccionArchivoGeneracion
          archivo={archivo}
          onArchivoChange={setArchivo}
        />

        {error ? <BloqueError error={error} /> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={procesar}
            disabled={!puedeProcesar}
            className="bg-action text-white hover:bg-action-hover disabled:bg-action/40"
          >
            {cargando
              ? COPY_M1A.acciones.procesando
              : COPY_M1A.acciones.procesar}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BloqueError({ error }: { error: ErrorFormatoArchivo }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-status-error/30 bg-red-50 p-4 text-sm text-status-error"
    >
      <p className="font-medium">{COPY_M1A.errores.titulo}</p>
      <p className="mt-1">{error.razon}</p>
      {error.detalle ? (
        <p className="mt-1 text-xs text-ink-secondary">{error.detalle}</p>
      ) : null}
    </div>
  );
}
