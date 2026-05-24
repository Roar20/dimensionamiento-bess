/**
 * Strings cliente-facing del módulo Resumen Ejecutivo.
 *
 * Dos colecciones:
 * - `COPY_RESUMEN_EJECUTIVO` — universal (encabezado, intro, fallback,
 *   etiquetas de cards, supuestos y trazabilidad). No depende de planta.
 * - `COPY_PLANTAS_CURADAS` — copy curado por planta (apertura, "qué pasa
 *   hoy", "qué cambia con almacenamiento", "recomendación preliminar").
 *   Texto verbatim del guion v2; no editar sin curaduría.
 *
 * Resolución de planta:
 * El componente nunca ramifica por nombre hardcodeado. Llama a
 * `buscarCopyDePlanta(slug)`, que itera el mapa y devuelve la entrada
 * cuyo `aliases` contenga el slug. Esto desacopla el match del tecleo
 * del operador en el onboarding: variantes razonables ("Tequila",
 * "Tequila 1", "Planta Tequila") activan la misma entrada por
 * construcción. La clave de cada entrada del mapa es el `planta_id`
 * real del contrato JSON (`public/data/manifest.json`) para que el día
 * que `DatosSFV` exponga `planta_id`, el lookup pase a ser directo y
 * los aliases dejen de ser necesarios sin reescribir el mapa.
 */

export const COPY_RESUMEN_EJECUTIVO = {
  tab: {
    label: "Resumen ejecutivo",
    tituloPagina: (planta: string) =>
      planta ? `Resumen ejecutivo — ${planta}` : "Resumen ejecutivo",
  },

  contextoTab: {
    kicker: "Resumen para junta",
    intro:
      "Este documento reúne, en una sola lectura, qué está pasando hoy con " +
      "la planta, qué cambia al incorporar almacenamiento, qué se " +
      "recomienda y bajo qué supuestos.",
  },

  fallbackPlantaNoCurada: {
    kicker: "Análisis en preparación",
    titulo: "Narrativa ejecutiva pendiente de curaduría para esta planta.",
    cuerpo:
      "La estructura del documento está disponible; la interpretación " +
      "ejecutiva sigue en preparación. Las cifras operativas y la " +
      "simulación detallada se consultan, mientras tanto, en los apartados " +
      "SFV y SFV+BESS.",
  },

  cardsOperacion: {
    seccionLabel: "Cómo se opera la batería",
    contexto:
      "Dos formas de operar la misma batería sobre el mismo dato horario. " +
      "La diferencia entre ambas es el argumento de por qué importa cuándo " +
      "descarga la batería, no solo cuánto.",
    libre: {
      titulo: "Operación libre",
      descripcion:
        "La batería descarga en cuanto tiene energía, a cualquier hora.",
    },
    restringida: {
      titulo: "Operación restringida a punta",
      descripcion:
        "La batería concentra su descarga en la ventana de mayor valor " +
        "tarifario (18:00–22:00).",
    },
    labels: {
      captura: "Captura anual",
      ciclos: "Utilización (ciclos)",
      fraccion: "Fracción capturada",
    },
    sinDatos:
      "Sin parámetros suficientes para simular las dos operaciones. Carga " +
      "una planta para ver las cards con datos reales.",
  },

  supuestos: {
    titulo: "Supuestos y alcance",
    intro:
      "Cuatro marcos que enmarcan el alcance del análisis. No son letra " +
      "chica: definen qué afirma este documento y qué queda fuera.",
    items: [
      {
        etiqueta: "Precios",
        texto:
          "Los precios de energía y potencia firme usados en la " +
          "cuantificación son de referencia y se ajustan con el histórico " +
          "real cuando se valide con la fuente oficial.",
      },
      {
        etiqueta: "Profundidad de datos",
        texto:
          "Para Estanzuela las cifras anualizadas se derivan de un mes de " +
          "datos reales: suficiente para una recomendación con sustento, " +
          "fortalecible con más historia. Tequila se apoya en generación " +
          "modelada sin precios reales.",
      },
      {
        etiqueta: "Contraste operativo, no captura contractual",
        texto:
          "Las cards de operación libre vs restringida muestran el " +
          "contraste operativo sobre toda la energía elegible. La " +
          "fracción efectivamente capturable bajo el PPA depende de la " +
          "frontera contractual con el offtaker, que está pendiente de " +
          "validar; cuando se confirme, se reevalúa la categoría base.",
      },
      {
        etiqueta: "Validaciones pendientes",
        texto:
          "Quedan pendientes la validación contractual con el offtaker " +
          "(frontera PPA y libertad sobre energía excedente) y la " +
          "validación de metodología regulatoria. Cualquiera de las dos " +
          "puede reabrir el framing de las recomendaciones.",
      },
    ],
  },

  metodologia: {
    titulo: "¿De dónde sale esto?",
    intro:
      "Trazabilidad de las gráficas y de la lógica de cálculo. Los " +
      "supuestos materiales viven en la sección anterior; aquí solo se " +
      "documenta de qué pieza del análisis proviene cada gráfica.",
    nota:
      "El detalle metodológico se amplía conforme avanza la documentación " +
      "del análisis.",
  },
} as const;

// ─── Mapa de copy curado por planta ──────────────────────────────────

export type CopyPlantaCurada = {
  /**
   * Slugs que activan esta entrada. El componente busca por `aliases`
   * (no por la clave del objeto), de modo que variantes razonables del
   * nombre tecleado por el operador en el onboarding caen a la misma
   * entrada sin requerir el nombre canónico verbatim. Mantener el
   * `planta_id` del contrato como primer alias (declaración explícita
   * del binding canónico).
   */
  aliases: readonly string[];
  hero: {
    kicker: string;
    titulo: string;
    apoyo: string;
  };
  quePasaHoy: {
    parrafos: readonly string[];
  };
  queCambia: {
    /** Texto narrativo arriba del visual/cards. */
    parrafo: string;
    /** Cuál visualización se usa: cards operación libre/restringida
     *  (Estanzuela) o contraste 1.0 vs +20% de generación (Tequila). */
    visual: "cards-operacion" | "factor-generacion";
    /** Nota debajo del visual, opcional. */
    nota?: string;
  };
  recomendacionPreliminar: {
    kicker: string;
    titulo: string;
    bullets: readonly string[];
    nota?: string;
  };
};

export const COPY_PLANTAS_CURADAS: Readonly<Record<string, CopyPlantaCurada>> = {
  "tequila-1": {
    aliases: ["tequila-1", "tequila", "planta-tequila", "tequila-fv"],
    hero: {
      kicker: "Apertura",
      titulo:
        "El sistema solar de Tequila opera hoy dentro de su capacidad de inyección.",
      apoyo:
        "El valor de un sistema de almacenamiento aparece bajo un escenario " +
        "de aumento de generación cercano al 20% —equivalente, por ejemplo, " +
        "a la instalación de un tracker— cuando los picos cruzan el punto " +
        "de interconexión.",
    },
    quePasaHoy: {
      parrafos: [
        "La curva de generación promedio se mantiene por debajo del punto " +
          "de interconexión (500 kW); el pico no alcanza ese límite. Hoy " +
          "no hay energía excedente sobre el punto de interconexión que un " +
          "almacenamiento pueda capturar: el sistema no topa su capacidad " +
          "de inyección. Generación anual cercana a 913 MWh.",
      ],
    },
    queCambia: {
      parrafo:
        "Al elevar la generación cerca de un 20% —equivalente, por ejemplo, " +
        "a un tracker— la curva cruza el punto de interconexión y emerge " +
        "una zona de energía capturable en las horas centrales del día. El " +
        "aumento de generación no solo produce más energía; crea las " +
        "condiciones físicas para que un almacenamiento tenga energía que " +
        "capturar.",
      visual: "factor-generacion",
      nota:
        "El +20% modela el efecto de un tracker sobre el perfil horario. " +
        "Tequila no tiene tracker ni terreno adicional hoy; esto ilustra " +
        "el escenario, no una instalación existente.",
    },
    recomendacionPreliminar: {
      kicker: "Recomendación preliminar",
      titulo: "300 kW × 4 horas como punto de partida",
      bullets: [
        "Punto de partida razonable, condicionado a que se incorpore mayor generación (tracker).",
        "Condicionado a validar el comportamiento de precios PML en la zona.",
        "Es un punto de partida, no la solución final.",
      ],
      nota: "La configuración final se afina con el histórico de precios PML.",
    },
  },
  "estanzuela-1": {
    aliases: ["estanzuela-1", "estanzuela", "planta-estanzuela", "estanzuela-fv"],
    hero: {
      kicker: "Apertura",
      titulo:
        "Estanzuela reúne las condiciones para capturar valor con " +
        "almacenamiento: tiene tracker, terreno adicional y un mes de " +
        "datos de precios reales.",
      apoyo:
        "Sobre esa base, una batería de 450 kW × 4 horas sirve como " +
        "dimensionamiento de referencia.",
    },
    quePasaHoy: {
      parrafos: [
        "Sistema con tracker y terreno adicional, con un mes de datos de " +
          "precios reales (a diferencia de Tequila, que solo cuenta con " +
          "generación). Aquí no se supone el potencial: se observa con " +
          "datos.",
      ],
    },
    queCambia: {
      parrafo:
        "Comparación de dos formas de operar la batería. En operación " +
        "libre, descarga en cuanto tiene energía, a cualquier hora. En " +
        "operación restringida a punta, concentra la descarga en la " +
        "ventana tarifaria de mayor valor (18–22h). La diferencia entre " +
        "ambas muestra por qué importa cuándo descarga la batería, no " +
        "solo cuánto.",
      visual: "cards-operacion",
      nota:
        "La comparación se hace sobre toda la energía elegible; la " +
        "fracción efectivamente capturable bajo el PPA está pendiente de " +
        "validar la frontera contractual.",
    },
    recomendacionPreliminar: {
      kicker: "Recomendación preliminar",
      titulo: "450 kW × 4 horas como dimensionamiento de referencia",
      bullets: [
        "Operación restringida que concentra la descarga en la ventana tarifaria de mayor valor (18–22h) como la de mayor aprovechamiento.",
        "Con un mes de datos, la recomendación tiene sustento.",
      ],
      nota: "El histórico completo de precios fortalece la recomendación.",
    },
  },
} as const;

/**
 * Resuelve una entrada de copy curado a partir del slug producido por
 * `slugDePlanta(config.nombre)`. Itera el mapa y devuelve la primera
 * entrada cuyos `aliases` contengan el slug exacto. Devuelve `null` si
 * ninguna planta curada lista el slug — el componente debe renderizar
 * el fallback honesto en ese caso.
 *
 * La búsqueda es por alias, no por clave del objeto, para que el match
 * no dependa del nombre verbatim tecleado por el operador.
 */
export function buscarCopyDePlanta(slug: string): CopyPlantaCurada | null {
  if (!slug) return null;
  for (const entrada of Object.values(COPY_PLANTAS_CURADAS)) {
    if (entrada.aliases.includes(slug)) return entrada;
  }
  return null;
}
