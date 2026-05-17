import { useState } from "react";

import { Button } from "@/components/ui/button";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import type { DatosSFV } from "@/types/sfv";
import { ModalCambiarPlanta } from "./ModalCambiarPlanta";

interface Props {
  datos: DatosSFV;
  onCambiar: () => void;
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function EncabezadoContextual({ datos, onCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const { config, meta } = datos;

  const fechaCarga = (() => {
    try {
      return FORMATO_FECHA.format(new Date(meta.fecha_carga));
    } catch {
      return meta.fecha_carga;
    }
  })();

  return (
    <div className="w-full border-b border-brand-cardBorder bg-white">
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-ink-primary">
              {config.nombre}
            </span>
            {config.cliente ? (
              <>
                <Separator />
                <span className="text-ink-secondary">{config.cliente}</span>
              </>
            ) : null}
            {config.ubicacion ? (
              <>
                <Separator />
                <span className="text-ink-secondary">{config.ubicacion}</span>
              </>
            ) : null}
            <Separator />
            <span className="text-ink-secondary">
              {FORMATO_ENTERO.format(config.capacidad_instalada_kw)} kW PV
            </span>
            <Separator />
            <span className="text-ink-secondary">
              {FORMATO_ENTERO.format(config.capacidad_poi_kw)} kW POI
            </span>
          </div>
          <div className="mt-1 text-xs text-ink-helper">
            {COPY_M2.encabezado.registrosHorarios(meta.total_horas)} ·{" "}
            {COPY_M2.encabezado.cargado(fechaCarga)}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAbierto(true)}
        >
          {COPY_M2.encabezado.botonCambiar}
        </Button>
      </div>

      <ModalCambiarPlanta
        abierto={abierto}
        onCancelar={() => setAbierto(false)}
        onConfirmar={() => {
          setAbierto(false);
          onCambiar();
        }}
      />
    </div>
  );
}

function Separator() {
  return <span className="text-slate-300">·</span>;
}
