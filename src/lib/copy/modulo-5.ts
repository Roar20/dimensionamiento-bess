export const COPY_M5 = {
  hero: {
    titulo: "El valor del BESS sin tocar tu permiso CFE",
    parrafo1: (poi: number) =>
      `Tu permiso CFE autoriza ${poi.toLocaleString("es-MX")} kW de capacidad de interconexión. Esa capacidad se mantiene intacta. El BESS no la modifica, no requiere ampliación, y no implica trámite adicional ante CFE. Lo que hace es mover en el tiempo la energía que tu SFV ya está generando, llevándola desde las horas de sol hasta la hora-punta CFE (18–22 h) donde vale más en el mercado.`,
    parrafo2:
      "Aquí abajo verás cuánto valor produce ese movimiento bajo distintos supuestos de tu PPA.",
  },
  seccion1: {
    titulo: "1. Tu configuración del BESS",
    descripcion:
      "Elige el equipo Hyperstrong y cuántas unidades en paralelo quieres simular. La recomendación del Tab BESS está preseleccionada.",
    badgeRecomendado: "Recomendado",
    multiplicador: {
      label: "Unidades en paralelo",
      tooltip:
        "Hyperstrong soporta hasta 20 unidades en paralelo. Cada unidad agrega su potencia y capacidad nominal al sistema.",
    },
    kpis: {
      potenciaTotal: "Potencia total",
      capacidadTotal: "Capacidad total",
      duracionNominal: "Duración nominal",
      inversion: "Inversión estimada",
    },
  },
  seccion2: {
    titulo: "2. ¿Cuánta energía captura el BESS bajo cada supuesto?",
    descripcion:
      "Las 4 categorías de energía representan distintos frentes posibles del PPA. Para cada una, el BESS captura una porción según la estrategia de despacho.",
    disponibles: "disponibles para almacenar",
    greedy: "Estrategia greedy",
    arbitraje: "Estrategia arbitraje",
    capturado: (pct: number, ciclos: number) =>
      `${pct.toFixed(0)}% capturado · ${Math.round(ciclos)} ciclos`,
    capturadoArbitraje: (pct: number, ciclos: number, horasPunta: number) =>
      `${pct.toFixed(0)}% capturado · ${Math.round(ciclos)} ciclos · ${horasPunta} h en punta`,
    sinCaptura:
      "Sin energía capturable bajo este supuesto. Si tu PPA realmente tiene esta forma, el BESS no aplica.",
  },
  seccion3: {
    titulo: "3. Cómo trabaja el BESS en un día promedio",
    descripcion: (nDias: number) =>
      `Promedio de los ${nDias.toLocaleString("es-MX")} días del periodo. Compara cómo se comporta el BESS bajo cada estrategia.`,
    descripcionDia: (label: string) =>
      `Comportamiento detallado del ${label}.`,
    greedyTitulo: "Estrategia greedy",
    greedyTexto:
      "El BESS carga apenas hay energía y descarga apenas no la hay. Sin restricción horaria.",
    arbitrajeTitulo: "Estrategia arbitraje (recomendada)",
    arbitrajeTexto:
      "El BESS carga durante el día y descarga SOLO en hora-punta CFE (18-22h).",
    insight:
      "La estrategia arbitraje concentra la descarga en hora-punta donde la energía vale más.",
    series: {
      generacion: "Generación SFV",
      cargando: "Cargando BESS",
      descargando: "Descargando BESS",
      soc: "Estado de carga (%)",
    },
    bandaPunta: "Hora-punta CFE",
  },
  seccion4: {
    titulo: "4. Captura por periodo",
    descripcion:
      "Cuánta energía se carga y se descarga en cada subintervalo del periodo seleccionado.",
    series: {
      cargado: "Cargado (arbitraje)",
      descargado: "Descargado (arbitraje)",
      energiaCategoria: "Energía disponible",
    },
  },
  seccion5: {
    titulo: "5. Comparativa de estrategias",
    descripcion:
      "Las dos estrategias mueven energía distinta a horas distintas. Aquí ves los totales para la categoría activa.",
    columnas: {
      kpi: "KPI",
      greedy: "Greedy",
      arbitraje: "Arbitraje",
      diferencia: "Diferencia",
    },
    filas: {
      cargado: "Cargado total (MWh)",
      descargado: "Descargado total (MWh)",
      ciclos: "Ciclos equivalentes",
      horasPunta: "Horas de descarga en hora-punta",
      energiaPunta: "Energía descargada en hora-punta (MWh)",
    },
    recomendacionPrefijo: "Recomendación:",
  },
  seccion6: {
    titulo: "6. Resumen ejecutivo",
    cta: "Siguiente paso: el análisis financiero cuantifica cuánto vale en pesos este movimiento de energía.",
    botonFinanciero: "Análisis financiero →",
    botonTooltip: "Disponible en próximo módulo",
  },
  selectorCategoria: {
    label: "Categoría de energía a analizar:",
    ninguna: "Energía fuera de hora-punta CFE (referencia)",
  },
} as const;
