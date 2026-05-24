import { SeccionGeneracionFactor } from "@/components/tab-financiero/SeccionGeneracionFactor";
import type { CopyPlantaCurada } from "@/lib/copy/resumen-ejecutivo";
import type { KPIsSimulacion } from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

import { CardsOperacion } from "./CardsOperacion";

interface Props {
  /** Copy curado de la planta activa, o `null` si no hay curaduría. */
  curado: CopyPlantaCurada | null;
  /** Datos crudos para alimentar visualizaciones que corren del motor. */
  datosVisual: {
    registros: readonly RegistroHorario[];
    capacidadPoiKw: number;
    capacidadCargaBessKw: number;
  };
  /** KPIs para las cards (Estanzuela). */
  kpisOperaciones: {
    libre: KPIsSimulacion | null;
    restringida: KPIsSimulacion | null;
  };
}

const TITULO = "¿Qué cambia con almacenamiento?";

/**
 * Sección "¿Qué cambia con almacenamiento?" — la única sección cuyo
 * *visual* cambia por planta:
 *   - `visual: "cards-operacion"` (p. ej. Estanzuela) → `CardsOperacion`.
 *   - `visual: "factor-generacion"` (p. ej. Tequila) → `SeccionGeneracionFactor`
 *     (contraste de sobreinstalación 1.0× vs 1.20× — pendiente de
 *     implementación completa).
 *
 * El componente NO conoce los nombres de planta; lee `curado.queCambia.visual`
 * del mapa. Sin curaduría, degrada a estado vacío honesto.
 */
export function SeccionQueCambia({ curado, datosVisual, kpisOperaciones }: Props) {
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {TITULO}
      </h3>
      {curado ? (
        <>
          <p className="mb-4 max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
            {curado.queCambia.parrafo}
          </p>
          {curado.queCambia.visual === "cards-operacion" ? (
            <CardsOperacion
              libre={kpisOperaciones.libre}
              restringida={kpisOperaciones.restringida}
            />
          ) : (
            <VisualFactorGeneracionPendiente
              registros={datosVisual.registros}
              capacidadPoiKw={datosVisual.capacidadPoiKw}
              capacidadCargaBessKw={datosVisual.capacidadCargaBessKw}
            />
          )}
          {curado.queCambia.nota ? (
            <p className="mt-3 text-[12px] italic leading-[1.55] text-[var(--color-text-tertiary)]">
              {curado.queCambia.nota}
            </p>
          ) : null}
        </>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-4">
          <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
            La narrativa de "qué cambia con almacenamiento" depende de la
            estrategia ejecutiva de cada planta y vive en el guion curado.
            Las cifras crudas están disponibles en los tabs SFV+BESS y
            Análisis financiero.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Andamio para el visual "1.0× vs 1.20×". Por ahora renderiza el
 * componente existente con factor 1.0 (registros tal cual) y deja
 * marcador honesto del contraste pendiente. Cuando la especificación
 * del visual 1.0/1.20 esté cerrada, se reemplaza por una composición
 * lado-a-lado con registros escalados.
 */
function VisualFactorGeneracionPendiente({
  registros,
  capacidadPoiKw,
  capacidadCargaBessKw,
}: {
  registros: readonly RegistroHorario[];
  capacidadPoiKw: number;
  capacidadCargaBessKw: number;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Generación actual (factor 1.0×)
      </div>
      <SeccionGeneracionFactor
        registros_ajustados={registros}
        capacidad_poi_kw={capacidadPoiKw}
        capacidad_carga_bess_kw={capacidadCargaBessKw}
      />
      <div className="mt-3 rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-3">
        <p className="text-[12px] leading-[1.55] text-[var(--color-text-secondary)]">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Contraste con sobreinstalación 1.20×:
          </strong>{" "}
          el visual lado-a-lado y la cuantificación de excedentes que emergen
          a 1.20× se incorporan en la próxima iteración. Por ahora se muestra
          la generación actual como referencia.
        </p>
      </div>
    </div>
  );
}
