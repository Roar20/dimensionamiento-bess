import type { RegistroHorario } from "@/types/sfv";
import { nombreMes } from "./filtrar-por-periodo";

export type ResumenMes = {
  anio: number;
  mes: number;
  nombre: string;
  energia_mwh: number;
  pico_kw: number;
  dias_con_generacion: number;
  hora_pico_promedio: number | null;
  mejor_dia_fecha: string | null;
  mejor_dia_mwh: number;
  peor_dia_fecha: string | null;
  peor_dia_mwh: number;
};

function fechaISO(ts: Date): string {
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function agregarPorMes(
  registros: readonly RegistroHorario[]
): ResumenMes[] {
  const grupos = new Map<string, RegistroHorario[]>();
  for (const r of registros) {
    const clave = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}`;
    const arr = grupos.get(clave) ?? [];
    arr.push(r);
    grupos.set(clave, arr);
  }

  const resultado: ResumenMes[] = [];
  for (const [clave, regs] of grupos) {
    const [anioStr, mesStr] = clave.split("-");
    const anio = Number(anioStr);
    const mes = Number(mesStr);

    let energia = 0;
    let pico = 0;
    const energiaPorDia = new Map<string, number>();
    const sumaPorHora = new Map<number, number>();
    const conteoPorHora = new Map<number, number>();

    for (const r of regs) {
      energia += r.energia_mwh;
      if (r.potencia_kw_prom > pico) pico = r.potencia_kw_prom;

      const fecha = fechaISO(r.timestamp);
      energiaPorDia.set(
        fecha,
        (energiaPorDia.get(fecha) ?? 0) + r.energia_mwh
      );

      const hora = r.timestamp.getHours() + 1;
      sumaPorHora.set(hora, (sumaPorHora.get(hora) ?? 0) + r.potencia_kw_prom);
      conteoPorHora.set(hora, (conteoPorHora.get(hora) ?? 0) + 1);
    }

    let mejorFecha: string | null = null;
    let mejorMwh = -Infinity;
    let peorFecha: string | null = null;
    let peorMwh = Infinity;
    let diasConGen = 0;
    for (const [fecha, mwh] of energiaPorDia) {
      if (mwh > 0) diasConGen += 1;
      if (mwh > mejorMwh) {
        mejorMwh = mwh;
        mejorFecha = fecha;
      }
      if (mwh > 0 && mwh < peorMwh) {
        peorMwh = mwh;
        peorFecha = fecha;
      }
    }

    let horaPicoProm: number | null = null;
    let mejorProm = -Infinity;
    for (const [hora, suma] of sumaPorHora) {
      const conteo = conteoPorHora.get(hora) ?? 0;
      if (conteo === 0) continue;
      const prom = suma / conteo;
      if (prom > mejorProm) {
        mejorProm = prom;
        horaPicoProm = hora;
      }
    }

    resultado.push({
      anio,
      mes,
      nombre: nombreMes(mes),
      energia_mwh: redondear(energia, 4),
      pico_kw: redondear(pico, 2),
      dias_con_generacion: diasConGen,
      hora_pico_promedio: horaPicoProm,
      mejor_dia_fecha: mejorFecha,
      mejor_dia_mwh: mejorMwh === -Infinity ? 0 : redondear(mejorMwh, 4),
      peor_dia_fecha: peorFecha,
      peor_dia_mwh: peorMwh === Infinity ? 0 : redondear(peorMwh, 4),
    });
  }

  resultado.sort((a, b) => (a.anio - b.anio) * 100 + (a.mes - b.mes));
  return resultado;
}

function redondear(n: number, decimales: number): number {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
}

export function resumenMensualACSV(resumen: readonly ResumenMes[]): string {
  const headers = [
    "Mes",
    "Año",
    "Energía (MWh)",
    "Pico (kW)",
    "Días con generación",
    "Hora pico promedio",
    "Mejor día",
    "Mejor día (MWh)",
    "Peor día",
    "Peor día (MWh)",
  ];
  const filas = resumen.map((r) => [
    r.nombre,
    r.anio,
    r.energia_mwh.toFixed(4),
    r.pico_kw.toFixed(2),
    r.dias_con_generacion,
    r.hora_pico_promedio ?? "",
    r.mejor_dia_fecha ?? "",
    r.mejor_dia_mwh.toFixed(4),
    r.peor_dia_fecha ?? "",
    r.peor_dia_mwh.toFixed(4),
  ]);
  return [headers, ...filas]
    .map((linea) => linea.map(escaparCsv).join(","))
    .join("\n");
}

function escaparCsv(valor: string | number): string {
  const s = String(valor);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
