import type { RegistroHorario } from "@/types/sfv";
import type { ConfiguracionBESS } from "@/types/bess";

/**
 * Genera 24 registros de un día. En las `horas_con_generacion`
 * (inicio-intervalo 0..23) se asigna `kw_por_hora_constante`; las demás
 * quedan en 0.
 */
export function generarDiaConGeneracion(
  fechaISO: string,
  kw_por_hora_constante: number,
  horas_con_generacion: readonly number[]
): RegistroHorario[] {
  const [yStr, mStr, dStr] = fechaISO.split("-");
  const fecha = new Date(
    Number(yStr),
    Number(mStr) - 1,
    Number(dStr),
    0,
    0,
    0,
    0
  );
  const set = new Set(horas_con_generacion);
  const registros: RegistroHorario[] = [];
  for (let h = 0; h < 24; h += 1) {
    const ts = new Date(fecha);
    ts.setHours(h, 0, 0, 0);
    const tieneGen = set.has(h);
    const energia_mwh = tieneGen ? kw_por_hora_constante / 1000 : 0;
    registros.push({
      timestamp: ts,
      energia_mwh,
      potencia_kw_prom: energia_mwh * 1000,
    });
  }
  return registros;
}

export const CONFIG_BESS_TEST: ConfiguracionBESS = {
  p_kw: 250,
  e_kwh: 1000,
  dod: 0.95,
  rte: 0.85,
  soc_inicial_kwh: 0,
};
