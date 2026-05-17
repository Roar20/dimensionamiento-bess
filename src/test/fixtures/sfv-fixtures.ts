import type { RegistroHorario } from "@/types/sfv";

/**
 * Genera un registro horario. Convención inicio-de-intervalo:
 * `horaInicio = 0` corresponde a hora-ending 1 (00:00-01:00).
 */
export function createRegistro(
  fecha: string,
  horaInicio: number,
  energia_mwh: number
): RegistroHorario {
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error(`Fecha inválida: ${fecha}`);
  }
  const ts = new Date(y, m - 1, d, horaInicio, 0, 0, 0);
  return {
    timestamp: ts,
    energia_mwh,
    potencia_kw_prom: energia_mwh * 1000,
  };
}

/**
 * Genera 24 registros de un día con perfil gaussiano centrado al mediodía.
 * `centroHoraInicio` y `sigmaHoras` se expresan en convención inicio-de-intervalo
 * (`getHours()` 0..23). `picoKw` se aplica como amplitud de la gaussiana.
 */
export function generarDiaSintetico(
  fecha: string,
  picoKw: number,
  sigmaHoras: number,
  centroHoraInicio = 12
): RegistroHorario[] {
  const registros: RegistroHorario[] = [];
  for (let h = 0; h < 24; h += 1) {
    const kW =
      picoKw * Math.exp(-((h - centroHoraInicio) ** 2) / (2 * sigmaHoras ** 2));
    registros.push(createRegistro(fecha, h, kW / 1000));
  }
  return registros;
}

/**
 * Genera 24 registros con generación constante de `kwPorHora` durante
 * la ventana `[horaInicioGen, horaFinGen]` (en convención inicio-de-intervalo,
 * ambos inclusive) y 0 fuera de ella.
 */
export function generarDiaPlano(
  fecha: string,
  kwPorHora: number,
  horaInicioGen: number,
  horaFinGen: number
): RegistroHorario[] {
  const registros: RegistroHorario[] = [];
  for (let h = 0; h < 24; h += 1) {
    const generando = h >= horaInicioGen && h <= horaFinGen;
    registros.push(createRegistro(fecha, h, generando ? kwPorHora / 1000 : 0));
  }
  return registros;
}

export function sumarDias(fechaBase: string, dias: number): string {
  const [y, m, d] = fechaBase.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Fecha inválida: ${fechaBase}`);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + dias);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
