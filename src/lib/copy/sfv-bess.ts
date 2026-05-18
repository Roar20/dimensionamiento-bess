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
    plantilla: (args: {
      energia_capturada_mwh: number;
      ciclos: number;
      payback_anios: number | null;
      estrategia: string;
      equipo_nombre: string;
    }) => {
      // Caso degenerado: la combinación categoría + estrategia no captura
      // energía. Texto alterno reorienta a probar otra config.
      if (args.energia_capturada_mwh < 0.05) {
        return (
          `Bajo la categoría seleccionada y la estrategia ${args.estrategia}, ` +
          `el BESS ${args.equipo_nombre} no captura energía. ` +
          `Prueba otra categoría o cambia a la estrategia alternativa.`
        );
      }
      const cap = formato1Dec(args.energia_capturada_mwh);
      const ciclos = formatoEntero(args.ciclos);
      const pb =
        args.payback_anios === null
          ? "el payback no es calculable bajo los precios proxy actuales"
          : `el payback preliminar con precios proxy Estanzuela 2 es de ${formato1Dec(args.payback_anios)} años para ${args.equipo_nombre}`;
      return (
        `El BESS captura ${cap} MWh anuales bajo estrategia ${args.estrategia}, ` +
        `equivalentes a ${ciclos} ciclos efectivos. ${capitalizar(pb)}.`
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
      `Fuente: registros horarios SFV ${planta} · año base ${anio}`,
  },
} as const;

function capitalizar(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
