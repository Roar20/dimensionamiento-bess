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
} as const;
