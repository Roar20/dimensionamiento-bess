import type { EstadoHorario } from "@/types/bess";
import type { Granularidad } from "@/lib/tab-sfv/filtrar-por-periodo";

export type PuntoCaptura = {
  id: string;
  label: string;
  inicio: Date;
  cargado_mwh: number;
  descargado_mwh: number;
  energia_categoria_mwh: number;
};

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function claveYLabel(
  e: EstadoHorario,
  granularidad: Granularidad
): { clave: string; label: string; inicio: Date } {
  const t = e.timestamp;
  switch (granularidad) {
    case "anual":
    case "semestral":
    case "trimestral": {
      const y = t.getFullYear();
      const m = t.getMonth();
      return {
        clave: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: `${MESES_CORTOS[m]}`,
        inicio: new Date(y, m, 1, 0, 0, 0, 0),
      };
    }
    case "mensual": {
      const y = t.getFullYear();
      const m = t.getMonth();
      const d = t.getDate();
      return {
        clave: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        label: String(d),
        inicio: new Date(y, m, d, 0, 0, 0, 0),
      };
    }
    case "semanal": {
      const y = t.getFullYear();
      const m = t.getMonth();
      const d = t.getDate();
      return {
        clave: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        label: `${DIAS_CORTOS[t.getDay()]} ${d}`,
        inicio: new Date(y, m, d, 0, 0, 0, 0),
      };
    }
    case "diario": {
      const h = t.getHours() + 1;
      return {
        clave: `h${h}`,
        label: `${h}h`,
        inicio: new Date(
          t.getFullYear(),
          t.getMonth(),
          t.getDate(),
          h - 1,
          0,
          0,
          0
        ),
      };
    }
  }
}

export function agregarCapturaPorPeriodo(
  detalleArbitraje: readonly EstadoHorario[],
  granularidad: Granularidad
): PuntoCaptura[] {
  const buckets = new Map<
    string,
    {
      label: string;
      inicio: Date;
      cargado_kwh: number;
      descargado_kwh: number;
      energia_categoria_mwh: number;
    }
  >();

  for (const e of detalleArbitraje) {
    const { clave, label, inicio } = claveYLabel(e, granularidad);
    const b = buckets.get(clave) ?? {
      label,
      inicio,
      cargado_kwh: 0,
      descargado_kwh: 0,
      energia_categoria_mwh: 0,
    };
    b.cargado_kwh += e.cargado_kwh;
    b.descargado_kwh += e.descargado_kwh;
    b.energia_categoria_mwh += e.energia_categoria_mwh;
    buckets.set(clave, b);
  }

  return [...buckets.entries()]
    .map(([clave, b]) => ({
      id: clave,
      label: b.label,
      inicio: b.inicio,
      cargado_mwh: b.cargado_kwh / 1000,
      descargado_mwh: b.descargado_kwh / 1000,
      energia_categoria_mwh: b.energia_categoria_mwh,
    }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}
