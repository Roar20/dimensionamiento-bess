/**
 * Strings cliente-facing del tab Resumen Ejecutivo.
 *
 * Arquitectura:
 * - `COPY_RESUMEN_EJECUTIVO` agrupa lo *universal* (tab label, intros
 *   genéricas, sección 5 disclaimers, sección 6 metodología) — no
 *   depende de planta.
 * - `COPY_PLANTAS_CURADAS` indexa el copy *curado por planta* (hero,
 *   sección "¿Qué cambia?", recomendación preliminar). El componente
 *   degrada graduado:
 *     a) si la clave de planta existe → renderiza copy curado.
 *     b) si no existe → renderiza estado "vacío honesto" con
 *        `COPY_RESUMEN_EJECUTIVO.fallbackPlantaNoCurada`.
 *
 * Clave del mapa: por ahora `slugDePlanta(config.nombre)` (interim —
 * `DatosSFV` todavía no expone `planta_id` real del contrato JSON). El
 * componente nunca hace `if planta === 'tequila'`; siempre lee del
 * mapa. Cuando se introduzca `planta_id` en `DatosSFV`, solo cambia el
 * cálculo de la clave; los consumidores no se enteran.
 *
 * Cero hardcode en componentes, mismo patrón que `COPY_SFV_BESS`.
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
      "Este tab compila lo que un tomador de decisión necesita ver en una " +
      "sola pasada: qué está pasando hoy, qué cambia con almacenamiento, " +
      "qué se recomienda y bajo qué supuestos.",
  },

  fallbackPlantaNoCurada: {
    kicker: "Sin curaduría ejecutiva",
    titulo:
      "Análisis ejecutivo pendiente de curaduría para esta planta.",
    cuerpo:
      "Las secciones que dependen de copy curado (apertura, narrativa de " +
      "cambio con almacenamiento, recomendación preliminar) se publican " +
      "una vez que el equipo de análisis cierre el guion para esta planta. " +
      "Las secciones que corren del motor (cards de operación, supuestos y " +
      "alcance, trazabilidad) se renderizan igual con los datos cargados.",
  },

  // Etiquetas comunes de los bloques que sí corren del motor.
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
      "Estos cuatro puntos enmarcan el alcance del análisis. No son letra " +
      "chica: definen qué afirma el deck y qué queda fuera.",
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
      "Trazabilidad de los pantallazos y de la lógica de cálculo. Los " +
      "supuestos materiales viven en la sección anterior; aquí solo se " +
      "documenta de qué componente del software sale cada gráfica.",
    nota: "Esta sección se completa cuando el tab incorpore el resto de los componentes.",
  },
} as const;

// ─── Mapa de copy curado por planta ──────────────────────────────────
// Cada entrada concentra el copy curado de las secciones que NO corren
// del motor: hero, "¿Qué pasa hoy?", "¿Qué cambia con almacenamiento?",
// "Recomendación preliminar". Los textos marcados con
// PLACEHOLDER_GUION_V2 son strings de andamio hasta que el guion v2
// curado se transcriba verbatim. NO inventar matices: editar solo
// cuando llegue el copy oficial.

const PLACEHOLDER_GUION_V2 =
  "[Pendiente de transcribir verbatim desde el guion v2 curado.]";

export type CopyPlantaCurada = {
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
    /** Cuál visualización se usa: cards operación libre/restringida (Estanzuela)
     *  o contraste de generación con sobreinstalación (Tequila). */
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
  tequila: {
    hero: {
      kicker: "Apertura",
      titulo: PLACEHOLDER_GUION_V2,
      apoyo:
        "Frase de apertura curada para Tequila — pegar desde guion v2 " +
        "(arranca con 'El sistema solar de Tequila opera hoy dentro de " +
        "su capacidad de inyección…').",
    },
    quePasaHoy: {
      parrafos: [PLACEHOLDER_GUION_V2],
    },
    queCambia: {
      parrafo:
        "Texto narrativo del contraste para Tequila — pegar desde guion v2. " +
        "Núcleo del argumento: hoy no hay excedentes; con sobreinstalación " +
        "al 1.20× emergen los MWh elegibles para BESS.",
      visual: "factor-generacion",
      nota: PLACEHOLDER_GUION_V2,
    },
    recomendacionPreliminar: {
      kicker: "Recomendación preliminar",
      titulo: "300×4 condicionado a sobreinstalación",
      bullets: [PLACEHOLDER_GUION_V2],
      nota: PLACEHOLDER_GUION_V2,
    },
  },
  estanzuela: {
    hero: {
      kicker: "Apertura",
      titulo: PLACEHOLDER_GUION_V2,
      apoyo:
        "Frase de apertura curada para Estanzuela — pegar desde guion v2 " +
        "(arranca con 'Estanzuela reúne las condiciones…').",
    },
    quePasaHoy: {
      parrafos: [PLACEHOLDER_GUION_V2],
    },
    queCambia: {
      parrafo:
        "Texto narrativo del contraste para Estanzuela — pegar desde guion v2. " +
        "Núcleo del argumento: la batería puede operar libre o concentrar la " +
        "descarga en punta tarifaria; las cards cuantifican ambas.",
      visual: "cards-operacion",
      nota: PLACEHOLDER_GUION_V2,
    },
    recomendacionPreliminar: {
      kicker: "Recomendación preliminar",
      titulo: "450×4 como referencia",
      bullets: [PLACEHOLDER_GUION_V2],
      nota: PLACEHOLDER_GUION_V2,
    },
  },
} as const;
