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
        `La configuración Cube Plus captura ${cap} MWh anuales bajo estrategia ${args.estrategia}, ` +
        `equivalentes a ${ciclos} ciclos efectivos. ${capitalizar(pb)}.`
      );
    },
  },

  /**
   * Hero ejecutivo "captura-vs-ciclos" (D-SFV-06).
   *
   * Versión INTERINA con TITULAR + APOYO CONDICIONALES:
   * `fraccion_capturada` se calcula sobre la energía candidata de la
   * categoría activa, NO sobre generación total. Para el mismo Cube
   * Plus, da fracciones radicalmente distintas según la categoría:
   * ~10% en "toda la energía", ~65% en "arriba del compromiso PPA",
   * ~0% en "exceso capacidad CFE". Por tanto el copy del hero NO puede
   * afirmar magnitud fija — debe ser condicional según el valor real,
   * y SIEMPRE nombrar la categoría activa.
   *
   * Insight de producto: cuando la fracción es baja y los ciclos son
   * altos, el BESS opera saturado — su capacidad es el factor
   * limitante. Esto es argumento de venta de mayor capacidad, no
   * debilidad. Cuando el motor incorpore barrido de configuraciones,
   * el hero evoluciona a comparar capacidades.
   */
  heroCapturaCiclos: {
    label: "Equipo de referencia: Cube Plus",
    titular: {
      alta: (config: string, natural: string) =>
        `La configuración de ${config} aprovecha prácticamente toda la energía elegible bajo ${natural} con una alta utilización anual del BESS.`,
      media: (config: string, natural: string) =>
        `La configuración de ${config} captura una parte significativa de la energía elegible bajo ${natural}, operando con alta utilización anual.`,
      baja: (config: string, natural: string) =>
        `El equipo ${config} opera con alta utilización anual, aunque captura solo una fracción de la energía elegible bajo ${natural}.`,
      nula: (_config: string, natural: string) =>
        `Bajo ${natural}, la planta prácticamente no presenta energía disponible para almacenamiento con la configuración actual.`,
    },
    apoyo: {
      alta: "La estrategia actual aprovecha prácticamente toda la energía elegible de esta categoría.",
      media:
        "La estrategia actual captura una porción relevante de la energía elegible bajo esta categoría.",
      baja: "El Cube Plus representa una configuración compacta de referencia del catálogo. Configuraciones de mayor capacidad se evalúan en el comparativo de esta misma vista.",
      nula: "Bajo esta categoría, la planta prácticamente no presenta energía disponible para almacenamiento.",
    },
    microAprovechamiento: {
      label: "Aprovechamiento",
      valor: (pct: number) => `${pct}% de energía elegible capturada`,
    },
    microUtilizacion: {
      label: "Utilización del activo",
      valor: (ciclos: string) => `${ciclos} ciclos/año`,
    },
    /**
     * Mapeo `tipo` → lenguaje natural para encajar gramaticalmente en
     * "elegible bajo {natural}". Las `etiqueta` del catálogo
     * (`categoria-energia.ts`) están escritas para títulos de KPIs y no
     * fluyen en esta construcción; este mapeo es local al hero.
     */
    nombreCategoriaNatural: {
      toda_energia: "la operación con toda la energía",
      fuera_hora_punta_cfe: "energía fuera de hora-punta CFE",
      compromiso_ppa_mensual_mwh: "energía por encima del compromiso PPA",
      exceso_capacidad_cfe_kw: "energía que excede capacidad CFE",
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

  filtrosAnalisis: {
    prefacio: "Análisis configurado por",
    labelCategoria: "Categoría",
  },

  comparacionConfiguraciones: {
    seccionLabel: "Comparación de configuraciones",
    titulo: "Barrido de configuraciones BESS",
    subtitulo:
      "Resultado del barrido sobre los datos cargados con ambas estrategias de despacho.",
    nota:
      "Esta vista muestra qué captura cada configuración sobre los datos cargados. " +
      "No define por sí sola la estrategia de carga u operación para plantas sin " +
      "excedentes; esa validación sigue en revisión metodológica.",
    notaEficiencia:
      "El barrido usa una eficiencia de referencia conservadora del sector industrial " +
      "y comercial (85%) para comparar tamaños genéricos; puede diferir de las " +
      "secciones basadas en equipos específicos del catálogo.",
    colapso: {
      resumen: (n: number, minPct: number, maxPct: number) =>
        `Se evaluaron ${n} configuraciones · captura entre ${minPct}% y ${maxPct}%`,
      lineaMetodologica:
        "El análisis distingue configuraciones técnicamente defendibles según su relación entre captura y capacidad.",
      ctaExpandir: (n: number) => `Ver las ${n} configuraciones evaluadas`,
      ctaColapsar: "Ocultar configuraciones",
    },
    tabla: {
      colConfig: "Configuración",
      colEstrategia: "Estrategia",
      colKwh: "Capacidad",
      colCaptura: "Captura",
      colCiclos: "Ciclos/año",
      colIndicador: "Indicador",
    },
    badges: {
      frente: "Frente",
      inflexion: "Inflexión",
    },
    banda: {
      limpio: {
        granularidad: "Granularidad horaria",
        cobertura: "Cobertura anual",
        registros: (n: number) => `${n.toLocaleString("es-MX")} registros`,
        periodo: (ini: string, fin: string) => `${ini} – ${fin}`,
      },
      advertencia: {
        titulo: "Advertencias del archivo cargado",
      },
    },
    estrategias: {
      greedy: "Greedy",
      arbitraje: "Arbitraje",
    },
  },

  comparativaEquipos: {
    seccionLabel: "Comparativa de equipos",
    headerCategoria: "Categoría",
    headerEstrategia: "Estrategia",
    fueraDeEscala: "Fuera de escala",
    sinSimulacion: "—",
    contextoLectura: (estrategia: string) =>
      `Cifras calculadas con estrategia ${estrategia}`,
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
