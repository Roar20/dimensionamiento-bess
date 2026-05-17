import type {
  PerfilHorario,
  ResultadoCaracterizacion,
  Variabilidad,
} from "@/types/sfv-kpis";

import type { PeriodoActivo } from "./filtrar-por-periodo";

const FORMAT_MWH = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const FORMAT_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function formatMWh(mwh: number): string {
  return `${FORMAT_MWH.format(mwh)} MWh`;
}

export function formatFechaLarga(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  if (!y || !m || !d) return fechaISO;
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

export function formatHora(hora: number | null): string {
  if (hora === null) return "—";
  return `${String(hora).padStart(2, "0")}:00 h`;
}

export function generarNarrativaSeccion1(
  recurso: ResultadoCaracterizacion,
  horasConGeneracion: number,
  periodo: PeriodoActivo
): string {
  const pct =
    recurso.horas_totales > 0
      ? Math.round((horasConGeneracion / recurso.horas_totales) * 100)
      : 0;
  return `Durante ${periodo.label}, tu SFV generó ${formatMWh(recurso.energia_total_mwh)} repartidos en ${FORMAT_ENTERO.format(horasConGeneracion)} horas de sol efectivo. Esto representa que estuvo produciendo energía el ${pct}% del tiempo disponible del periodo.`;
}

export function generarNarrativaSeccion2(
  perfil: PerfilHorario,
  periodo: PeriodoActivo
): string {
  return `En ${periodo.label}, tu SFV empezó a generar a las ${formatHora(perfil.hora_inicio_generacion)}, alcanzó su pico a las ${formatHora(perfil.hora_pico)} y dejó de producir hacia las ${formatHora(perfil.hora_fin_generacion)}. Durante la hora-punta CFE (18-22h), tu SFV cubrió solo ${perfil.pct_energia_en_punta.toFixed(1)}% de su generación total — el resto se produjo durante el día.`;
}

export function generarNarrativaSeccion3(
  variab: Variabilidad,
  periodo: PeriodoActivo
): string {
  const cv = (variab.coef_variacion * 100).toFixed(1);
  return `En ${periodo.label}, tu mejor día fue el ${formatFechaLarga(variab.dia_mejor_fecha)} con ${formatMWh(variab.dia_mejor_mwh)} y el peor día fue el ${formatFechaLarga(variab.dia_peor_fecha)} con ${formatMWh(variab.dia_peor_mwh)}. En promedio generas ${formatMWh(variab.promedio_mwh)} diarios con una variabilidad de ${cv}%. Se identificaron ${variab.n_dias_anomalos} días anómalos en el periodo.`;
}

export function generarNarrativaSeccion4(mesLabel: string): string {
  return `Este mapa de calor muestra qué momentos de ${mesLabel} generaron más energía. Los colores naranjas a rojos indican picos de generación; los amarillos pálidos indican momentos de baja producción. Mira las franjas de mediodía: ahí se concentra el grueso de la energía del SFV.`;
}
