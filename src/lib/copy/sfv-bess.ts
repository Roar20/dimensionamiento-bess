/**
 * Strings cliente-facing del Tab SFV+BESS. Cero hardcode en componentes.
 */
export const COPY_SFV_BESS = {
  header: {
    titulo: (planta: string) => `Análisis del SFV + BESS — ${planta}`,
    tituloSinPlanta: "Análisis del SFV + BESS",
  },

  lecturaEjecutiva: {
    label: "Lectura ejecutiva",
    // Template; los valores se interpolan en runtime.
    plantilla: (args: {
      energia_capturada_mwh: number;
      ciclos: number;
      payback_anios: number | null;
      estrategia: string;
    }) => {
      const cap = formato1Dec(args.energia_capturada_mwh);
      const ciclos = formatoEntero(args.ciclos);
      const pb =
        args.payback_anios === null
          ? "payback no calculable bajo los precios proxy actuales"
          : `payback preliminar de ${formato1Dec(args.payback_anios)} años bajo los precios proxy`;
      return (
        `El BESS captura ${cap} MWh anuales sobre la categoría seleccionada y ` +
        `entrega ${ciclos} ciclos equivalentes con estrategia ${args.estrategia}, ` +
        `con ${pb} — los precios son editables arriba para sensibilizar.`
      );
    },
  },

  paneles: {
    precios: {
      titulo: "Precios proxy editables",
      banner:
        "Precios default tomados de Estanzuela 2. Confirmar con offtaker antes del cierre.",
      energia: "Precio energía PPA",
      energiaUnidad: "MXN/MWh",
      potenciaFirme: "Precio potencia firme",
      potenciaFirmeUnidad: "MXN/MW-mes",
      cel: "Precio CEL",
      celUnidad: "MXN/MWh",
      reset: "Restablecer defaults",
    },
  },

  banda: {
    seccionLabel: "Indicadores de captura y despacho",
    energiaCapturada: "Energía capturada",
    energiaDespachada: "Energía despachada",
    cicloAnuales: "Ciclos anuales",
    fraccionCapturada: "Fracción capturada",
  },

  charts: {
    despachoTitulo: "Despacho diario promedio",
    despachoSubtitulo:
      "Generación, carga y descarga por hora del día · promedio de 365 días",
    capturaTitulo: "Captura mensual",
    capturaSubtitulo:
      "Energía AC capturada por el BESS, agregada por mes del año base",
    despachoUnidad: "kW",
    capturaUnidad: "MWh/mes",
  },

  estrategias: {
    seccionLabel: "Comparativa de estrategias",
    greedy: "Greedy",
    arbitraje: "Arbitraje",
    descripcionGreedy:
      "Cargar apenas haya energía en la categoría; descargar apenas la categoría se agote.",
    descripcionArbitraje:
      "Cargar todo el día; descargar exclusivamente en hora-punta CFE (18:00–22:00).",
  },

  comparativaEquipos: {
    seccionLabel: "Comparativa de equipos",
    headerCategoria: "Categoría",
    headerEstrategia: "Estrategia",
    fueraDeEscala: "Fuera de escala",
    sinSimulacion: "—",
  },

  metodologia: {
    titulo: "Metodología y supuestos",
    fuente: (planta: string, anio: number) =>
      `Datos: registros horarios SFV ${planta} ${anio}.`,
  },

  footer: {
    fuente: (planta: string, anio: number) =>
      `Fuente: cincominutales SFV ${planta} · año base ${anio}`,
  },
} as const;

function formato1Dec(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
}

function formatoEntero(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(n);
}
