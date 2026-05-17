import { useMemo, useState } from "react";

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
import type { ConfiguracionPlanta, Warning } from "@/types/sfv";
import { ErrorFormatoArchivo } from "@/types/sfv";
import { CajaComoFunciona } from "@/components/onboarding/CajaComoFunciona";
import {
  SeccionDatosCliente,
  type DatosCliente,
} from "@/components/onboarding/SeccionDatosCliente";
import {
  SeccionParametrosContractuales,
  type ParametrosContractuales,
} from "@/components/onboarding/SeccionParametrosContractuales";
import { SeccionArchivoGeneracion } from "@/components/onboarding/SeccionArchivoGeneracion";

const CLIENTE_INICIAL: DatosCliente = { nombre: "", cliente: "", ubicacion: "" };
const PARAMETROS_INICIAL: ParametrosContractuales = {
  poi: "",
  instalada: "",
  zonaLmp: "",
  precioPpa: "",
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
  const [cliente, setCliente] = useState<DatosCliente>(CLIENTE_INICIAL);
  const [parametros, setParametros] =
    useState<ParametrosContractuales>(PARAMETROS_INICIAL);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const config = useMemo<ConfiguracionPlanta | null>(() => {
    const nombre = cliente.nombre.trim();
    const poi = Number(parametros.poi);
    const instalada = Number(parametros.instalada);
    if (!nombre) return null;
    if (!Number.isFinite(poi) || poi <= 0) return null;
    if (!Number.isFinite(instalada) || instalada <= 0) return null;
    const precio = parametros.precioPpa.trim();
    const precioParseado = precio === "" ? null : Number(precio);
    if (precioParseado !== null && (!Number.isFinite(precioParseado) || precioParseado <= 0)) {
      return null;
    }
    return {
      nombre,
      cliente: cliente.cliente.trim() || null,
      ubicacion: cliente.ubicacion.trim() || null,
      capacidad_poi_kw: poi,
      capacidad_instalada_kw: instalada,
      zona_lmp: parametros.zonaLmp.trim() || null,
      precio_ppa_mxn_mwh: precioParseado,
    };
  }, [cliente, parametros]);

  const puedeProcesar = !!config && !!archivo && !cargando;

  const procesar = async () => {
    if (!config || !archivo) return;
    await cargar(archivo, config);
  };

  return (
    <div className="space-y-6 pb-12">
      <Hero />

      <div className="container max-w-4xl space-y-5">
        <SeccionDatosCliente valores={cliente} onChange={setCliente} />
        <SeccionParametrosContractuales
          valores={parametros}
          onChange={setParametros}
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
            className="bg-action text-white hover:bg-action-hover"
          >
            {cargando ? COPY_M1A.acciones.procesando : COPY_M1A.acciones.procesar}
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
        <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
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
      <p className="font-semibold">{COPY_M1A.errores.titulo}</p>
      <p className="mt-1">{error.razon}</p>
      {error.detalle ? (
        <p className="mt-1 text-xs text-ink-secondary">{error.detalle}</p>
      ) : null}
    </div>
  );
}

export type WarningResumen = Warning;
