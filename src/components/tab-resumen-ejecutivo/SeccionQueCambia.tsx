import { SeccionGeneracionFactor } from "@/components/tab-financiero/SeccionGeneracionFactor";
import type { CopyPlantaCurada } from "@/lib/copy/resumen-ejecutivo";
import { aplicarFactorProduccion } from "@/lib/tab-financiero/calculos";
import type { KPIsSimulacion } from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

import { CardsOperacion } from "./CardsOperacion";

interface Props {
  /** Copy curado de la planta activa, o `null` si no hay curaduría. */
  curado: CopyPlantaCurada | null;
  /** Datos crudos para alimentar visualizaciones que corren del producto. */
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
 *   - `visual: "cards-operacion"` (Estanzuela) → `CardsOperacion`.
 *   - `visual: "factor-generacion"` (Tequila) → dos `SeccionGeneracionFactor`
 *     lado-a-lado: generación actual (factor 1.0×) y generación con +20%
 *     adicional. El contraste muestra cómo aparece la zona capturable
 *     cuando la curva cruza el punto de interconexión.
 *
 * El componente lee `curado.queCambia.visual` del mapa; no conoce
 * nombres de planta. Sin curaduría, degrada a estado vacío honesto.
 */
export function SeccionQueCambia({ curado, datosVisual, kpisOperaciones }: Props) {
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {TITULO}
      </h3>
      {curado ? (
        <>
          <p className="mb-5 max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
            {curado.queCambia.parrafo}
          </p>
          {curado.queCambia.visual === "cards-operacion" ? (
            <CardsOperacion
              libre={kpisOperaciones.libre}
              restringida={kpisOperaciones.restringida}
            />
          ) : (
            <VisualContrasteFactor
              registros={datosVisual.registros}
              capacidadPoiKw={datosVisual.capacidadPoiKw}
              capacidadCargaBessKw={datosVisual.capacidadCargaBessKw}
            />
          )}
          {curado.queCambia.nota ? (
            <p className="mt-4 max-w-[680px] text-[12px] italic leading-[1.55] text-[var(--color-text-tertiary)]">
              {curado.queCambia.nota}
            </p>
          ) : null}
        </>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-4">
          <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
            La interpretación ejecutiva del cambio con almacenamiento sigue
            en preparación para esta planta. Las simulaciones detalladas
            están disponibles en los apartados SFV+BESS y Análisis
            financiero.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Contraste lado-a-lado: generación actual vs generación con +20%
 * adicional. Cada panel reusa `SeccionGeneracionFactor` con su propio
 * encabezado; la curva del panel izquierdo no cruza el POI (sin zona
 * capturable), la del panel derecho sí (emerge zona capturable).
 */
function VisualContrasteFactor({
  registros,
  capacidadPoiKw,
  capacidadCargaBessKw,
}: {
  registros: readonly RegistroHorario[];
  capacidadPoiKw: number;
  capacidadCargaBessKw: number;
}) {
  const registrosActual = aplicarFactorProduccion(registros, 1.0);
  const registrosAumentado = aplicarFactorProduccion(registros, 1.2);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SeccionGeneracionFactor
        registros_ajustados={registrosActual}
        capacidad_poi_kw={capacidadPoiKw}
        capacidad_carga_bess_kw={capacidadCargaBessKw}
        header={<EncabezadoFactor titulo="Generación actual" descripcion="La curva no cruza el punto de interconexión: no hay zona capturable." />}
      />
      <SeccionGeneracionFactor
        registros_ajustados={registrosAumentado}
        capacidad_poi_kw={capacidadPoiKw}
        capacidad_carga_bess_kw={capacidadCargaBessKw}
        header={<EncabezadoFactor titulo="Con +20% de generación" descripcion="La curva cruza el punto de interconexión y emerge una zona capturable en las horas centrales." />}
      />
    </div>
  );
}

function EncabezadoFactor({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <header className="mb-3">
      <h4 className="text-[14px] font-medium text-[var(--color-text-primary)]">
        {titulo}
      </h4>
      <p className="text-[12px] leading-[1.55] text-[var(--color-text-secondary)]">
        {descripcion}
      </p>
    </header>
  );
}
