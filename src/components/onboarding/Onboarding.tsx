import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import type { ConfiguracionPlanta } from "@/types/sfv";
import { ErrorFormatoArchivo } from "@/types/sfv";
import { CajaComoFunciona } from "@/components/onboarding/CajaComoFunciona";
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
  hayDatosPersistidos: boolean;
  cargando: boolean;
  error: ErrorFormatoArchivo | null;
  cargar: (file: File, config: ConfiguracionPlanta) => Promise<void>;
  onRehidratar: () => void;
  onBorrar: () => void;
}

export function Onboarding({
  hayDatosPersistidos,
  cargando,
  error,
  cargar,
  onRehidratar,
  onBorrar,
}: Props) {
  const [estado, setEstado] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

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
    <div className="space-y-6 pb-12">
      <Hero />

      <div className="container max-w-4xl space-y-5">
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
          {hayDatosPersistidos ? (
            <>
              <Button type="button" variant="ghost" onClick={onRehidratar}>
                {COPY_M1A.acciones.cargarAnterior}
              </Button>
              <button
                type="button"
                onClick={() => setConfirmarBorrar(true)}
                className="text-sm text-ink-helper underline-offset-4 hover:underline"
              >
                {COPY_M1A.acciones.borrar}
              </button>
            </>
          ) : null}
        </div>

        <CajaComoFunciona />
      </div>

      <Dialog open={confirmarBorrar} onOpenChange={setConfirmarBorrar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {COPY_M1A.acciones.confirmarBorrar.titulo}
            </DialogTitle>
            <DialogDescription>
              {COPY_M1A.acciones.confirmarBorrar.descripcion}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmarBorrar(false)}
            >
              {COPY_M1A.acciones.confirmarBorrar.cancelar}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onBorrar();
                setConfirmarBorrar(false);
              }}
            >
              {COPY_M1A.acciones.confirmarBorrar.confirmar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Hero() {
  const copy = COPY_M1A.hero;
  return (
    <section className="bg-brand-header text-brand-headerFg">
      <div className="container max-w-4xl space-y-2 py-10">
        <h1 className="text-2xl font-medium leading-tight md:text-3xl">
          {copy.titulo}
        </h1>
        <p className="max-w-2xl text-sm text-white/80 md:text-base">
          {copy.subtitulo}
        </p>
      </div>
    </section>
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
