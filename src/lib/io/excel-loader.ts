import * as XLSX from "xlsx";

import {
  ErrorFormatoArchivo,
  type ConfiguracionPlanta,
  type Cobertura,
  type DatosSFV,
  type Granularidad,
  type RegistroHorario,
  type Warning,
} from "@/types/sfv";

const HEADER_DIA = "día de operación";
const HEADER_HORA = "hora";
const HEADER_ENERGIA = "energía registrada [mwh]";

type ResultadoCarga = {
  datos: DatosSFV;
  warnings: Warning[];
};

export async function cargarArchivoSFV(
  file: File,
  config: ConfiguracionPlanta
): Promise<ResultadoCarga> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });

  if (workbook.SheetNames.length === 0) {
    throw new ErrorFormatoArchivo("El archivo no contiene hojas de cálculo.");
  }

  const primeraHoja = workbook.SheetNames[0];
  if (!primeraHoja) {
    throw new ErrorFormatoArchivo("El archivo no contiene hojas de cálculo.");
  }
  const sheet = workbook.Sheets[primeraHoja];
  if (!sheet) {
    throw new ErrorFormatoArchivo("La primera hoja del archivo está vacía.");
  }

  const filas = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  const headerInfo = localizarHeader(filas);
  if (!headerInfo) {
    throw new ErrorFormatoArchivo(
      "No se encontró la fila de encabezados.",
      `Se esperan las columnas "Día de Operación", "Hora" y "Energía Registrada [MWh]".`
    );
  }

  const registros = leerRegistros(filas, headerInfo);
  if (registros.length === 0) {
    throw new ErrorFormatoArchivo(
      "No se encontraron registros horarios válidos en el archivo."
    );
  }

  const meta = calcularMeta(registros, file.name);
  const warnings = calcularWarnings(meta, config, registros);

  return {
    datos: {
      config,
      registros,
      meta,
    },
    warnings,
  };
}

type HeaderInfo = {
  filaIndex: number;
  colDia: number;
  colHora: number;
  colEnergia: number;
};

/**
 * Detecta filas de totales (mensuales o anuales) sin importar en qué columna
 * cayó la etiqueta. El operador exporta el reporte con la palabra "Total" en
 * la columna padding o en la columna de fecha, según la versión del template.
 *
 * Una fila legítima de datos no contiene strings con "total" en ningún campo
 * relevante (fecha es Date/serial, hora es número 1-24, energía es número),
 * por lo que el escaneo es seguro.
 */
function esFilaDeTotales(fila: readonly unknown[]): boolean {
  for (const valor of fila) {
    if (typeof valor === "string" && valor.toLowerCase().includes("total")) {
      return true;
    }
  }
  return false;
}

function localizarHeader(filas: unknown[][]): HeaderInfo | null {
  for (let i = 0; i < filas.length; i += 1) {
    const fila = filas[i];
    if (!fila) continue;
    let colDia = -1;
    let colHora = -1;
    let colEnergia = -1;
    for (let j = 0; j < fila.length; j += 1) {
      const valor = fila[j];
      const etiqueta = normalizar(valor);
      if (etiqueta === HEADER_DIA) colDia = j;
      else if (etiqueta === HEADER_HORA) colHora = j;
      else if (etiqueta === HEADER_ENERGIA) colEnergia = j;
    }
    if (colDia >= 0 && colHora >= 0 && colEnergia >= 0) {
      return { filaIndex: i, colDia, colHora, colEnergia };
    }
  }
  return null;
}

function leerRegistros(
  filas: unknown[][],
  header: HeaderInfo
): RegistroHorario[] {
  const registros: RegistroHorario[] = [];
  for (let i = header.filaIndex + 1; i < filas.length; i += 1) {
    const fila = filas[i];
    if (!fila) continue;

    // Saltar (no terminar) filas de totales — mensuales, trimestrales o el
    // anual final. Aparecen en distintas posiciones según cómo el operador
    // exporte el reporte, así que escaneamos la fila completa.
    if (esFilaDeTotales(fila)) continue;

    const valorDia = fila[header.colDia];
    const valorHora = fila[header.colHora];
    const valorEnergia = fila[header.colEnergia];

    if (
      valorDia === null ||
      valorDia === undefined ||
      valorDia === "" ||
      valorHora === null ||
      valorHora === undefined ||
      valorHora === "" ||
      valorEnergia === null ||
      valorEnergia === undefined ||
      valorEnergia === ""
    ) {
      continue;
    }

    const fecha = parsearFecha(valorDia);
    const hora = parsearHora(valorHora);
    const energia = parsearNumero(valorEnergia);

    if (!fecha || hora === null || energia === null) {
      continue;
    }

    const timestamp = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      hora - 1,
      0,
      0,
      0
    );

    registros.push({
      timestamp,
      energia_mwh: energia,
      potencia_kw_prom: energia * 1000,
    });
  }
  return registros;
}

function parsearFecha(valor: unknown): Date | null {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor;
  }
  if (typeof valor === "number" && Number.isFinite(valor)) {
    const parsed = XLSX.SSF.parse_date_code(valor);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d, 0, 0, 0, 0);
  }
  if (typeof valor === "string") {
    const trimmed = valor.trim();
    if (trimmed === "") return null;

    // DD/MM/YYYY o DD-MM-YYYY (formato es-MX, como exporta Excel del cliente).
    // Se intenta ANTES de `new Date()` porque `new Date("13/01/2025")` falla:
    // V8 lo interpreta como M/D/Y (mes 13 → inválido).
    const mEsMx = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (mEsMx) {
      const d = Number(mEsMx[1]);
      const m = Number(mEsMx[2]);
      const y = Number(mEsMx[3]);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
        return new Date(y, m - 1, d, 0, 0, 0, 0);
      }
    }

    // YYYY-MM-DD (ISO) y otros formatos parseables por V8.
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0
      );
    }
  }
  return null;
}

function parsearHora(valor: unknown): number | null {
  const n = parsearNumero(valor);
  if (n === null) return null;
  const hora = Math.trunc(n);
  if (hora < 1 || hora > 24) return null;
  return hora;
}

function parsearNumero(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  if (typeof valor === "string") {
    const trimmed = valor.trim().replace(/,/g, "");
    if (trimmed === "") return null;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizar(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim().toLowerCase().replace(/\s+/g, " ");
}

function calcularMeta(
  registros: RegistroHorario[],
  nombreArchivo: string
): DatosSFV["meta"] {
  let total = 0;
  let horasConGen = 0;
  let pico = 0;
  let anioInferido = registros[0]?.timestamp.getFullYear() ?? new Date().getFullYear();
  let tsMin = Number.POSITIVE_INFINITY;
  let tsMax = Number.NEGATIVE_INFINITY;
  const conteoAnios = new Map<number, number>();

  for (const r of registros) {
    total += r.energia_mwh;
    if (r.energia_mwh > 0) horasConGen += 1;
    if (r.potencia_kw_prom > pico) pico = r.potencia_kw_prom;

    const t = r.timestamp.getTime();
    if (t < tsMin) tsMin = t;
    if (t > tsMax) tsMax = t;

    const anio = r.timestamp.getFullYear();
    conteoAnios.set(anio, (conteoAnios.get(anio) ?? 0) + 1);
  }

  let max = 0;
  for (const [anio, conteo] of conteoAnios) {
    if (conteo > max) {
      max = conteo;
      anioInferido = anio;
    }
  }

  const { granularidad, minutos_mediana_delta } =
    detectarGranularidad(registros);
  const cobertura = clasificarCobertura(registros.length, granularidad);

  return {
    nombre_archivo: nombreArchivo,
    fecha_carga: new Date().toISOString(),
    anio: anioInferido,
    total_horas: registros.length,
    total_energia_mwh: total,
    horas_con_generacion: horasConGen,
    pico_horario_kw: pico,
    periodo_inicio: registros.length > 0 ? new Date(tsMin) : null,
    periodo_fin: registros.length > 0 ? new Date(tsMax) : null,
    granularidad_detectada: granularidad,
    minutos_mediana_delta,
    cobertura,
  };
}

/**
 * Clasifica la granularidad de la serie usando la MEDIANA de los deltas
 * entre timestamps consecutivos. Se usa mediana (no promedio) para que
 * un hueco aislado (DST, registro faltante, separación entre meses) no
 * desplace la clasificación: con 8,759 deltas de 60 min y 1 de 48 h, la
 * mediana sigue siendo 60.
 *
 * Bandas:
 *  - mediana ∈ [55, 65]  → "horaria"   (tolera DST y huecos aislados)
 *  - mediana ∈ (0, 55)   → "sub_horaria"
 *  - mediana > 65        → "supra_horaria"
 *  - <2 registros o todos los deltas <= 0 → "desconocida"
 *
 * Pure function. No side effects. Exportada para validar el contrato
 * de detección sobre `RegistroHorario[]` sintéticos sin pasar por XLSX.
 */
export function detectarGranularidad(
  registros: readonly RegistroHorario[]
): { granularidad: Granularidad; minutos_mediana_delta: number | null } {
  if (registros.length < 2) {
    return { granularidad: "desconocida", minutos_mediana_delta: null };
  }
  const ordenados = [...registros].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  const deltasMs: number[] = [];
  for (let i = 1; i < ordenados.length; i += 1) {
    const d =
      ordenados[i]!.timestamp.getTime() - ordenados[i - 1]!.timestamp.getTime();
    if (d > 0) deltasMs.push(d);
  }
  if (deltasMs.length === 0) {
    return { granularidad: "desconocida", minutos_mediana_delta: null };
  }
  deltasMs.sort((a, b) => a - b);
  const mid = Math.floor(deltasMs.length / 2);
  const medianaMs =
    deltasMs.length % 2 === 0
      ? (deltasMs[mid - 1]! + deltasMs[mid]!) / 2
      : deltasMs[mid]!;
  const medianaMin = medianaMs / 60_000;

  let granularidad: Granularidad;
  if (medianaMin >= 55 && medianaMin <= 65) granularidad = "horaria";
  else if (medianaMin < 55) granularidad = "sub_horaria";
  else granularidad = "supra_horaria";

  return { granularidad, minutos_mediana_delta: medianaMin };
}

function clasificarCobertura(
  totalRegistros: number,
  granularidad: Granularidad
): Cobertura {
  if (granularidad !== "horaria") return "desconocida";
  if (totalRegistros === 8760 || totalRegistros === 8784) return "anual";
  return "parcial";
}

function calcularWarnings(
  meta: DatosSFV["meta"],
  config: ConfiguracionPlanta,
  registros: RegistroHorario[]
): Warning[] {
  const warnings: Warning[] = [];

  if (meta.total_horas !== 8760 && meta.total_horas !== 8784) {
    warnings.push({
      codigo: "HORAS_INCOMPLETAS",
      mensaje: `Se cargaron ${meta.total_horas.toLocaleString("es-MX")} registros horarios. Un año completo tiene 8,760 horas (o 8,784 si es bisiesto).`,
    });
  }

  if (meta.pico_horario_kw > config.capacidad_instalada_kw * 1.05) {
    warnings.push({
      codigo: "PICO_EXCEDE_INSTALADA",
      mensaje: `El pico horario de ${Math.round(meta.pico_horario_kw).toLocaleString("es-MX")} kW supera la capacidad instalada (${config.capacidad_instalada_kw.toLocaleString("es-MX")} kW) en más del 5%.`,
    });
  }

  if (meta.pico_horario_kw > config.capacidad_poi_kw * 1.05) {
    warnings.push({
      codigo: "PICO_EXCEDE_POI",
      mensaje: `El pico horario de ${Math.round(meta.pico_horario_kw).toLocaleString("es-MX")} kW supera la capacidad autorizada por CFE (${config.capacidad_poi_kw.toLocaleString("es-MX")} kW) en más del 5%.`,
    });
  }

  if (!cubreAnioCompleto(registros, meta.anio)) {
    warnings.push({
      codigo: "ANIO_NO_COMPLETO",
      mensaje: `Los registros no cubren el año ${meta.anio} completo (1 de enero al 31 de diciembre).`,
    });
  }

  const warningGranularidad = warningPorGranularidad(
    meta.granularidad_detectada,
    meta.minutos_mediana_delta
  );
  if (warningGranularidad) warnings.push(warningGranularidad);

  return warnings;
}

function warningPorGranularidad(
  granularidad: Granularidad,
  minutosMediana: number | null
): Warning | null {
  if (granularidad === "horaria") return null;
  if (granularidad === "desconocida") {
    return {
      codigo: "GRANULARIDAD_DESCONOCIDA",
      mensaje:
        "No se pudo detectar la granularidad temporal del archivo (se requieren al menos 2 registros con timestamps válidos).",
    };
  }
  const minutosTxt =
    minutosMediana !== null
      ? `${minutosMediana.toLocaleString("es-MX", { maximumFractionDigits: 1 })} min`
      : "desconocida";
  if (granularidad === "sub_horaria") {
    return {
      codigo: "GRANULARIDAD_SUB_HORARIA",
      mensaje: `Granularidad detectada: ~${minutosTxt} entre registros. El motor de despacho asume registros horarios; los KPIs (captura, ciclos, payback) pueden ser incorrectos. Si es posible, sube un archivo con registros horarios.`,
    };
  }
  return {
    codigo: "GRANULARIDAD_SUPRA_HORARIA",
    mensaje: `Granularidad detectada: ~${minutosTxt} entre registros (mayor a una hora). El motor de despacho asume registros horarios; los KPIs (captura, ciclos, payback) pueden ser incorrectos.`,
  };
}

function cubreAnioCompleto(registros: RegistroHorario[], anio: number): boolean {
  let minMes = 12;
  let maxMes = 1;
  let minDia = 32;
  let maxDia = 0;
  let coincide = false;

  for (const r of registros) {
    if (r.timestamp.getFullYear() !== anio) continue;
    coincide = true;
    const mes = r.timestamp.getMonth() + 1;
    const dia = r.timestamp.getDate();
    if (mes < minMes || (mes === minMes && dia < minDia)) {
      minMes = mes;
      minDia = dia;
    }
    if (mes > maxMes || (mes === maxMes && dia > maxDia)) {
      maxMes = mes;
      maxDia = dia;
    }
  }

  if (!coincide) return false;
  return minMes === 1 && minDia === 1 && maxMes === 12 && maxDia === 31;
}
