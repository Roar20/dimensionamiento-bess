export const COPY_M3 = {
  pagina: {
    titulo: "Catálogo de equipos BESS",
    subtitulo:
      "Sistemas de almacenamiento Hyperstrong disponibles para tu SFV.",
  },
  seccion1: {
    titulo: "1. ¿Qué es un BESS y qué resuelve para tu SFV?",
    queHace: {
      titulo: "¿Qué hace un BESS?",
      texto:
        "Un sistema de almacenamiento por baterías (BESS) guarda energía cuando tu SFV está generando y la entrega cuando esa energía vale más en el mercado eléctrico. No expande tu capacidad CFE; mueve la energía en el tiempo.",
    },
    porQue: {
      titulo: "¿Por qué importa para tu SFV?",
      texto:
        "La hora-punta de CFE (18-22h) tiene precios elevados pero tu SFV ya no genera porque el sol se metió. Un BESS captura una porción de la energía solar del día y la entrega exactamente en esa ventana, capturando el diferencial de precio sin tocar tu permiso de generación.",
    },
    familias: {
      titulo: "Tres familias de equipos disponibles",
      items: [
        "HyperCube II Plus — Pequeños proyectos C&I (125 kW × 261 kWh).",
        "HyperCube II Max — Proyectos C&I medianos (250 kW × 836 kWh).",
        "HyperBlock III — Escala utility (2.5 MW × 5 MWh).",
      ],
    },
    diagrama: {
      sfv: "SFV",
      sfvSub: "Genera de día",
      bess: "BESS",
      bessSub: "Almacena",
      red: "Red CFE",
      redSub: "Hora-punta 18-22 h",
    },
  },
  seccion2Energia: {
    titulo: "2. ¿Cuánta energía podríamos almacenar de tu SFV?",
    intro: (mwh: number) =>
      `Tu SFV genera ${Math.round(mwh).toLocaleString("es-MX")} MWh al año. La pregunta es: ¿cuánto de eso es energía técnicamente almacenable? La respuesta depende de tu PPA.`,
    parametros: {
      titulo: "Parámetros de tu PPA",
      subtitulo:
        "Estos parámetros definen cómo se descompone tu energía. Si conoces los valores reales, ajústalos.",
      compromiso: {
        label: "Compromiso mensual con el offtaker",
        tooltip:
          "Cantidad de energía mensual que tu SFV se compromete a entregar al offtaker bajo el PPA. Si conoces el compromiso real, ajústalo.",
        unidad: "MWh/mes",
        ayuda: (sugerido: number) =>
          `Sugerido: ${sugerido.toFixed(1)} MWh/mes (promedio mensual del SFV).`,
      },
      ventana: {
        label: "Ventana de hora-punta CFE",
        ayuda: "Default tarifa CFE GDMTH: 18:00–22:00.",
      },
      poi: {
        label: "Capacidad CFE (POI)",
        unidad: "kW",
        ayuda: "Capacidad de interconexión autorizada por CFE (de tu planta).",
      },
      resetear: "Restaurar valores sugeridos",
    },
    anatomia: {
      tituloPrefijo: "Anatomía de tu energía",
      tituloSufijo: (mwh: number) =>
        `${Math.round(mwh).toLocaleString("es-MX")} MWh/año`,
      subtitulo:
        "Cuánta energía cae en cada categoría según los supuestos de tu PPA. Las categorías son complementarias, no excluyentes.",
    },
    selector: {
      titulo: "¿Qué categoría aplica a tu PPA?",
      subtitulo:
        "Si sabes cuál de las categorías describe tu contrato, selecciónala para afinar la recomendación de equipo. Si no, mostramos todas.",
      ninguna: {
        label: "Aún no sabemos",
        descripcion: "Mostrar todas las categorías como rango.",
      },
      resumenItem: (mwh: number, pct: number) =>
        `${Math.round(mwh).toLocaleString("es-MX")} MWh/año (${pct.toFixed(0)}% del SFV)`,
    },
    puente: {
      titulo: "Energía a almacenar para la recomendación de equipo",
      labelCategoria: "Categoría seleccionada:",
      labelTotal: "Total:",
      labelRango: "Rango:",
      seleccionNinguna: "Aún no sabemos",
      ayudaNinguna:
        "Por la incertidumbre del PPA, mostramos un rango. El equipo recomendado abajo cubre los escenarios más probables sin sobredimensionar.",
      ayudaSeleccionada:
        "Este es el volumen de energía que podríamos almacenar y mover a hora-punta. El equipo abajo cubre este rango.",
      totalFormato: (anual: number, mensual: number) =>
        `${Math.round(anual).toLocaleString("es-MX")} MWh/año (~${mensual.toFixed(1)} MWh/mes promedio)`,
      rangoFormato: (min: number, max: number) =>
        `${Math.round(min).toLocaleString("es-MX")} – ${Math.round(max).toLocaleString("es-MX")} MWh/año`,
    },
  },
  seccion2: {
    titulo: "3. Equipos disponibles",
    sinPlanta:
      "Carga una planta para recibir una sugerencia de equipo óptimo. Mientras tanto, estos son los tres equipos del catálogo.",
    badgeRecomendado: "Punto de partida sugerido",
    kpiPotencia: "kW AC",
    kpiEnergia: "kWh",
    duracionLabel: (h: number) => `Duración nominal: ${h.toFixed(1)} h`,
    metaLabel: (familia: string, bateria: string, rte: number) =>
      `${familia} · ${bateria} · ${Math.round(rte * 100)}% RTE`,
    verFicha: "Ver ficha completa",
    cierre: (texto: string) =>
      `${texto} El dimensionamiento exacto (cuántas unidades, qué duración del BESS) se calcula en el Tab SFV + BESS.`,
  },
  seccion3: {
    titulo: "4. Comparativa técnica",
    descripcion:
      "Todos los datos provienen del datasheet oficial de Hyperstrong. La columna del equipo sugerido se resalta.",
    columnaCaracteristica: "Característica",
    filas: {
      potencia: "Potencia AC",
      energia: "Energía nominal",
      duracion: "Duración nominal",
      eficiencia: "Eficiencia máxima (RTE)",
      vidaUtil: "Vida útil mínima",
      tipoBateria: "Tipo de batería",
      configuracion: "Configuración",
      voltajeDc: "Voltaje DC nominal",
      rangoVoltaje: "Rango voltaje DC",
      temperatura: "Temperatura operación",
      dimensiones: "Dimensiones (W×D×H)",
      huella: "Huella en suelo",
      peso: "Peso",
      ipRating: "Protección IP (batería/gabinete)",
      cooling: "Refrigeración",
      comunicaciones: "Comunicación",
      precio: "Precio",
      costoUnitario: "Costo unitario",
      densidad: "Densidad energética",
      certificaciones: "Certificaciones",
    },
  },
  seccion4: {
    titulo: "5. Comparativas visuales",
    descripcion:
      "El equipo sugerido para tu planta aparece resaltado en verde.",
    graficas: {
      potencia: {
        titulo: "Potencia nominal (kW AC)",
        descripcion: "Capacidad de descarga continua del equipo.",
      },
      energia: {
        titulo: "Energía almacenable (kWh)",
        descripcion: "Cantidad de energía que puede guardar el equipo.",
      },
      densidad: {
        titulo: "Densidad energética (kWh/m²)",
        descripcion: "Cuánta energía cabe por m² de huella en suelo.",
      },
      costo: {
        titulo: "Costo unitario (USD/kWh)",
        descripcion:
          "Precio por kWh de capacidad almacenable. Menor es mejor.",
      },
    },
  },
  seccion5: {
    titulo: "6. Fichas técnicas detalladas",
    descripcion:
      "Datos completos por equipo y descarga del datasheet oficial cuando esté disponible.",
    descargarPdf: "Descargar datasheet (PDF)",
    pdfNoDisponible: "Datasheet próximamente",
    pdfVerificando: "Verificando…",
    abrir: "Mostrar ficha técnica",
    cerrar: "Ocultar ficha técnica",
    grupos: {
      potenciaEnergia: "Potencia y energía",
      bateria: "Batería",
      ambiente: "Ambiente",
      fisicas: "Características físicas",
      conectividad: "Conectividad y certificaciones",
      comercial: "Comercial",
    },
  },
  /**
   * Strings de la sección de Costo Unitario (PR P5). Ver docs/COPY.md
   * sección "Tab BESS — Costo Unitario" para el espejo editorial.
   */
  costoUnitario: {
    eyebrow: "Costo de capacidad",
    titulo: "Costo unitario por kWh nominal",
    subtitulo:
      "USD por kWh de capacidad nominal declarada · equipos aplicables a Tequila.",
    headline: "El Cube Max cuesta 17% menos por kWh que el Cube Plus.",
    chipBase: "Base: capacidad nominal",
    chipSensibilidad: "Sensibilidad DoD 95% en tooltip y metodología",
    tooltipBarra: (nominal: number, util: number) =>
      `Nominal $${nominal} · con DoD 95% ≈ $${util}`,
    blockIII: {
      badge: "No aplica a este tamaño",
      mensajePrincipal:
        "El HyperBlock III es demasiado grande para estas plantas con un punto de conexión de 500 kW.",
      mensajeSecundario:
        "Pertenece a proyectos de gran escala. Costo de referencia:",
      costoReferencia: "~$113 USD/kWh",
    },
    metodologia: {
      titulo: "Metodología del costo unitario",
      parrafoBase:
        "El costo base reportado es USD ÷ capacidad nominal declarada por datasheet, sin descontar profundidad de descarga (DoD) ni eficiencia round-trip (RTE). Es la métrica comparativa directa entre equipos.",
      parrafoSensibilidad:
        "La sensibilidad con DoD 95% — consistente con los supuestos de operación del catálogo — divide entre capacidad útil (capacidad × 0.95). Cube Plus pasa de $214 a ≈$225 USD/kWh útil; Cube Max pasa de $177 a ≈$186. El ranking no cambia.",
      parrafoBlockIII:
        "Block III queda fuera de la comparación por escala: 5 MWh por unidad es 6× la capacidad del Cube Max. Su precio por kWh es competitivo, pero no aplica para POI ≤ 500 kW del portafolio actual.",
    },
  },
  /**
   * Strings de la sección de Degradación SOH (PR P5). Ver docs/COPY.md
   * sección "Tab BESS — Degradación SOH" para el espejo editorial.
   */
  degradacionSoh: {
    eyebrow: "Vida útil del equipo",
    titulo: "Degradación del BESS a 20 años",
    subtitulo:
      "Retención de capacidad (SOH, State of Health) según la curva declarada por Hyperstrong para la familia LFP-314Ah, en condiciones nominales del datasheet.",
    headline:
      "La batería mantiene más del 80% de su capacidad hasta cerca del año 9.",
    lineaAsimetria:
      "La pérdida se concentra en los primeros años y se atenúa después.",
    tooltipHeadline:
      "El umbral del 80% es la convención de fin de vida útil de referencia para baterías estacionarias. El umbral del 70% corresponde a la garantía contractual típica del fabricante. Son dos conceptos distintos.",
    cardEntrega: { label: "SOH año 0", sublabel: "Entrega" },
    cardFinHorizonte: {
      label: "SOH año 20",
      sublabel: "Fin del horizonte modelado",
    },
    legend: {
      soh: "SOH (%) por año",
      umbralFinVida: "Fin de vida útil de referencia (80%)",
      umbralGarantia: "Umbral de garantía contractual típico (70%)",
    },
    callout: {
      titulo: "Fin de vida útil de referencia",
      sub: "Año 9 · 80% capacidad",
    },
    narrativa: {
      primeraDecada: {
        titulo: "Primera década",
        texto: (ppPorAno: string) =>
          `Pérdida promedio de ${ppPorAno} pp/año entre el año 1 y el año 10. Es la fase donde la química LFP entrega su perfil más exigente: estabilización del SEI, primer ciclo profundo y ajuste del balance celda-celda. Al cierre de esta década el banco se aproxima al fin de vida útil de referencia (80%, ≈ año 9).`,
      },
      segundaDecada: {
        titulo: "Segunda década",
        texto: (ppPorAno: string) =>
          `Pérdida promedio de ${ppPorAno} pp/año entre el año 10 y el año 20. La curva se aplana; la energía útil sigue cayendo pero a ritmo menor. El cruce del umbral de garantía contractual típico (70%) ocurre dentro de esta ventana, en línea con la vida útil declarada del equipo.`,
      },
    },
    tabla: {
      headers: {
        ano: "Año",
        soh: "SOH (%)",
        delta: "Δ vs año anterior (pp)",
        hito: "Hito",
      },
      hitos: {
        ano0: "Entrega",
        ano9: "Fin de vida útil de referencia (80%)",
        ano12: "Vida útil declarada Cube Max (>12 años)",
        ano15: "Vida útil declarada Cube Plus (>15 años)",
        ano16: "Umbral de garantía contractual (70%)",
        ano20: "Fin del horizonte modelado",
      },
    },
    disclaimer: {
      titulo: "Disclaimer y condiciones del dato:",
      cuerpo:
        "Los 21 valores graficados provienen de la curva SOH publicada por Hyperstrong para la plataforma LFP-314Ah en condiciones nominales del datasheet. La curva refleja un perfil declarado por el fabricante, no una garantía contractual: la carta formal de garantía de capacidad mínima vinculante está pendiente de confirmación con Hyperstrong. Las desviaciones operativas (temperaturas sostenidas fuera de rango, ciclado profundo continuo, sobre-corriente, tasa de carga/descarga exigente) aceleran la degradación más allá de lo modelado aquí.",
    },
    metodologia: {
      titulo: "Metodología y procedencia de la curva SOH",
      origen:
        "21 puntos anuales (año 0 al año 20) entregados por Hyperstrong para la plataforma LFP-314Ah, en condiciones nominales del datasheet. La curva es la misma para Cube Plus, Cube Max y Block III; el atributo distintivo entre equipos es la vida útil declarada, no la forma de la curva.",
    },
  },
} as const;
