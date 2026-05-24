/**
 * Strings cliente-facing del tab Resumen Ejecutivo. Espejo del patrón
 * de `COPY_SFV_BESS`: cero hardcode en componentes. Vocabulario
 * "operación libre / restringida a punta" en lugar de "greedy /
 * arbitraje" — el lector ejecutivo no debe ver jerga del motor (D-DECK-02).
 */
export const COPY_RESUMEN_EJECUTIVO = {
  tab: {
    label: "Resumen ejecutivo",
    tituloPagina: (planta: string) =>
      planta ? `Resumen ejecutivo — ${planta}` : "Resumen ejecutivo",
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
      "Estos tres puntos enmarcan el alcance del análisis. No son letra " +
      "chica: definen qué afirma el deck y qué queda fuera.",
    items: [
      {
        etiqueta: "Precios",
        texto:
          "Los precios de energía y potencia firme usados en la cuantificación " +
          "son de referencia y se ajustan con el histórico real cuando se " +
          "valide con la fuente oficial.",
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
        etiqueta: "Validaciones pendientes",
        texto:
          "Quedan pendientes la validación contractual con el offtaker " +
          "(frontera PPA y libertad sobre energía excedente) y la validación " +
          "de metodología regulatoria. Cualquiera de las dos puede reabrir " +
          "el framing de las recomendaciones.",
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
