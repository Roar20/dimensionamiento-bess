import type { ReactNode } from "react";

import { useCambiarPlanta } from "@/hooks/useCambiarPlanta";

interface PlantaMeta {
  anio: number;
  totalRegistros: number;
  poiKw: number;
  zonaLmp: string | null;
}

interface Props {
  /**
   * Título completo del header. El consumidor compone (incluyendo
   * sufijo "— {nombrePlanta}" si aplica). Fuente única de verdad de la
   * cadena visible en el <h1>.
   */
  titulo: string;
  /**
   * Metadata de planta. Si se pasa, renderiza chips (año, registros,
   * POI, zona LMP) y el botón "Cambiar planta". Si se omite, el header
   * muestra solo el título — variante para /bess sin datos cargados.
   * `zonaLmp` puede ser null: el chip de zona LMP se oculta.
   */
  meta?: PlantaMeta;
  /**
   * Slot al final de la fila de chips, para controles inline que
   * pertenecen al contexto del tab (p. ej. <TipoCambioInput> en /bess).
   * Se renderiza también cuando no hay `meta` (la fila aparece igual
   * para alojar el control).
   */
  slotFinal?: ReactNode;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function ProjectContextHeader({ titulo, meta, slotFinal }: Props) {
  const cambiarPlanta = useCambiarPlanta();
  const mostrarFilaChips = Boolean(meta) || Boolean(slotFinal);

  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="mb-1.5 text-2xl font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
          {titulo}
        </h1>
        {mostrarFilaChips ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
            {meta ? (
              <>
                <Chip icono="ti-calendar" texto={`Año base ${meta.anio}`} />
                <Chip
                  icono="ti-database"
                  texto={`${FORMATO_ENTERO.format(meta.totalRegistros)} registros horarios`}
                />
                <Chip
                  icono="ti-bolt"
                  texto={`POI ${FORMATO_ENTERO.format(meta.poiKw)} kW`}
                />
                {meta.zonaLmp ? (
                  <Chip icono="ti-map-pin" texto={`Zona LMP ${meta.zonaLmp}`} />
                ) : null}
              </>
            ) : null}
            {slotFinal}
          </div>
        ) : null}
      </div>
      {meta ? (
        <button
          type="button"
          onClick={cambiarPlanta}
          className="shrink-0 text-[12px] text-[var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-[var(--color-text-primary)] hover:underline"
        >
          Cambiar planta
        </button>
      ) : null}
    </header>
  );
}

function Chip({ icono, texto }: { icono: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className={`ti ${icono} text-[var(--color-text-tertiary)]`}
        aria-hidden="true"
      />
      {texto}
    </span>
  );
}
