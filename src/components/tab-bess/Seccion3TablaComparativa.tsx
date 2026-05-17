import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { useViewMode } from "@/context/ViewModeContext";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import {
  CATALOGO_HYPERSTRONG,
  costoPorKwh,
  densidadEnergetica,
  duracionNominalHoras,
  huellaEnSueloM2,
  type EquipoBESS,
} from "@/lib/bess/catalogo-hyperstrong";
import { cn } from "@/lib/utils";

interface Props {
  equipoRecomendadoId: string | null;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const FORMATO_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type Fila = {
  label: string;
  valor: (e: EquipoBESS) => string;
  destacar?: boolean;
};

const FILAS_BASE: Fila[] = [
  {
    label: COPY_M3.seccion3.filas.potencia,
    valor: (e) => `${FORMATO_ENTERO.format(e.kw_ac)} kW`,
  },
  {
    label: COPY_M3.seccion3.filas.energia,
    valor: (e) => `${FORMATO_ENTERO.format(e.kwh)} kWh`,
  },
  {
    label: COPY_M3.seccion3.filas.duracion,
    valor: (e) => `${duracionNominalHoras(e).toFixed(1)} h`,
  },
  {
    label: COPY_M3.seccion3.filas.eficiencia,
    valor: (e) => `${Math.round(e.eficiencia_max * 100)}%`,
  },
  {
    label: COPY_M3.seccion3.filas.vidaUtil,
    valor: (e) => `${e.vida_util_anios} años`,
  },
  {
    label: COPY_M3.seccion3.filas.tipoBateria,
    valor: (e) => e.tipo_bateria,
  },
  {
    label: COPY_M3.seccion3.filas.configuracion,
    valor: (e) => e.config_bateria,
  },
  {
    label: COPY_M3.seccion3.filas.voltajeDc,
    valor: (e) => `${FORMATO_ENTERO.format(e.voltaje_dc)} V`,
  },
  {
    label: COPY_M3.seccion3.filas.rangoVoltaje,
    valor: (e) =>
      `${FORMATO_ENTERO.format(e.voltaje_op_min_dc)}–${FORMATO_ENTERO.format(e.voltaje_op_max_dc)} V`,
  },
  {
    label: COPY_M3.seccion3.filas.temperatura,
    valor: (e) => `${e.temperatura_op_min_c}°C a ${e.temperatura_op_max_c}°C`,
  },
  {
    label: COPY_M3.seccion3.filas.dimensiones,
    valor: (e) =>
      `${(e.ancho_mm / 1000).toFixed(2)}×${(e.profundidad_mm / 1000).toFixed(2)}×${(e.alto_mm / 1000).toFixed(2)} m`,
  },
  {
    label: COPY_M3.seccion3.filas.huella,
    valor: (e) => `${huellaEnSueloM2(e).toFixed(2)} m²`,
  },
  {
    label: COPY_M3.seccion3.filas.peso,
    valor: (e) => `${FORMATO_ENTERO.format(e.peso_kg)} kg`,
  },
  {
    label: COPY_M3.seccion3.filas.ipRating,
    valor: (e) => `${e.ip_rating_bateria} / ${e.ip_rating_gabinete}`,
  },
  {
    label: COPY_M3.seccion3.filas.cooling,
    valor: (e) => e.cooling_method,
  },
  {
    label: COPY_M3.seccion3.filas.comunicaciones,
    valor: (e) => e.comunicaciones.join(" / "),
  },
  {
    label: COPY_M3.seccion3.filas.precio,
    valor: (e) => FORMATO_USD.format(e.precio_usd),
  },
  {
    label: COPY_M3.seccion3.filas.costoUnitario,
    valor: (e) => `${FORMATO_USD.format(costoPorKwh(e))}/kWh`,
    destacar: true,
  },
  {
    label: COPY_M3.seccion3.filas.densidad,
    valor: (e) => `${FORMATO_ENTERO.format(densidadEnergetica(e))} kWh/m²`,
    destacar: true,
  },
];

export function Seccion3TablaComparativa({ equipoRecomendadoId }: Props) {
  const { mode } = useViewMode();
  const copy = COPY_M3.seccion3;

  const filas: Fila[] = [
    ...FILAS_BASE,
    ...(mode === "tecnico"
      ? [
          {
            label: copy.filas.certificaciones,
            valor: (e: EquipoBESS) => e.certificaciones.join(", "),
          },
        ]
      : []),
  ];

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <div className="overflow-x-auto rounded-card border border-brand-cardBorder bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-cardBorder bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-helper">
              <th className="px-3 py-2">{copy.columnaCaracteristica}</th>
              {CATALOGO_HYPERSTRONG.map((e) => (
                <th
                  key={e.id}
                  className={cn(
                    "px-3 py-2",
                    e.id === equipoRecomendadoId &&
                      "bg-action/10 text-ink-primary"
                  )}
                >
                  {e.nombre_corto}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.label} className="border-b border-slate-100">
                <td
                  className={cn(
                    "px-3 py-2 text-ink-secondary",
                    fila.destacar && "font-medium text-ink-primary"
                  )}
                >
                  {fila.label}
                </td>
                {CATALOGO_HYPERSTRONG.map((e) => (
                  <td
                    key={e.id}
                    className={cn(
                      "px-3 py-2 tabular-nums text-ink-secondary",
                      e.id === equipoRecomendadoId &&
                        "bg-action/5 text-ink-primary",
                      fila.destacar && "font-semibold"
                    )}
                  >
                    {fila.valor(e)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
