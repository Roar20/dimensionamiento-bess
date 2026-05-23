/**
 * Copy oficial del Tab Análisis Financiero. Ver `docs/COPY.md` §
 * "Módulo Tab Análisis Financiero — Entrega 1a" y "Entrega 1b".
 *
 * Convención del repo: ningún string visible al usuario va hardcodeado
 * en JSX. Cada label/sublabel/tooltip que el cliente lee se declara
 * acá y se importa desde el componente.
 *
 * Naturaleza ejecutiva: lenguaje llano, sin acrónimos crudos
 * (LMP/GDMTH/WACC/PML solo donde sean necesarios como label técnico
 * acompañado de tooltip explicativo).
 *
 * Entrega 1b — coherencia narrativa "arbitraje" → "optimización":
 * en vistas ejecutivas (Comparativa, Waterfall, Evolución Económica,
 * Breakdown), "arbitraje" se suaviza a "optimización operativa" /
 * "optimización horaria" para evitar la connotación regulatoria fuerte
 * sobre datasets proxy/físicos. NO toca metodología técnica, fórmulas,
 * ni nombres de estrategia del motor — esos preservan vocabulario
 * preciso. "Proxy preliminar" → "Estimada" por la misma razón.
 */
export const COPY_TAB_FINANCIERO = {
  /** Hero / KPIs principales del Tab Análisis Financiero. */
  hero: {
    aporteBess: {
      label: "Aporte operativo estimado",
      sublabel:
        "Incluye captura energética y aporte a potencia firme, antes de costos de operación.",
      /** Badge inline al lado del valor. Suavizado en 1b. */
      badge: "incluye potencia firme estimada",
    },
  },

  /** Panel de configuración: labels visibles, ayudas inline y tooltips. */
  panelConfiguracion: {
    campos: {
      wacc: {
        label: "WACC (%)",
        tooltip:
          "Costo estimado de financiamiento y capital usado para evaluar la rentabilidad del proyecto.",
      },
      precioPotenciaFirme: {
        label: "Potencia firme (MXN/MW-mes)",
        tooltip:
          "Valor estimado asociado a la capacidad disponible para apoyar la demanda eléctrica.",
      },
      zonaNodal: {
        label: "Zona Nodal (MXN/MWh)",
        tooltip:
          "Referencia de precio eléctrico horario usada como aproximación económica regional.",
      },
      diferencialPuntaValle: {
        label: "Diferencial PML punta-valle (%)",
        ayuda: "Valor de referencia usado para estimaciones preliminares.",
        tooltip:
          "Diferencia estimada entre horas eléctricas de mayor y menor valor.",
      },
      factorCredibilidadPfirme: {
        label: "Factor credibilidad pot. firme",
        tooltip:
          "Porcentaje de confianza aplicado a la capacidad firme estimada del sistema.",
      },
    },
  },

  /** Sección "Comparativa SFV solo vs SFV + BESS". */
  comparativa: {
    sfvSolo: {
      subtitulo:
        "Sin almacenamiento, sin optimización horaria, sin potencia firme",
      bulletOptimizacion: "Optimización operativa horaria",
      bulletPotenciaFirme: "Potencia firme estimada",
    },
    sfvBess: {
      bulletOptimizacion: "Optimización operativa horaria",
      bulletPotenciaFirme: "Potencia firme estimada",
    },
    notaPie:
      "El payback BESS se calcula contra el aporte incremental (captura + optimización operativa + potencia firme − OPEX), no contra el ingreso del proyecto completo. El ingreso PPA y CELs del SFV son ingresos que la planta ya recibía sin BESS; mostrarlos como repago del CAPEX BESS sería contabilizar el dinero del SFV existente como mérito del nuevo equipo. El acumulado 20 años aplica curva SOH del catálogo sobre los tres componentes incrementales; el SFV no degrada con SOH BESS.",
  },

  /** Sección "Waterfall". */
  waterfall: {
    labelAporteOptimizacion: "+ Optimización operativa",
    /**
     * Label de la barra de potencia firme. La advertencia visual `⚑`
     * (footnote marker) y su leyenda asociada "proxy conservador
     * preliminar" se eliminaron en 1b: el flag duplicaba una advertencia
     * que ya vive en el badge del KPI hero, su tooltip canónico
     * (COPY_PROXY_PFIRME) y el tooltip del factor de credibilidad. La
     * trazabilidad metodológica se preserva en esas capas; el waterfall
     * adopta el lenguaje ejecutivo consistente con el resto del Tab.
     */
    labelAportePotenciaFirme: "+ Potencia firme estimada",
  },

  /** Sección "Evolución económica" (Aporte incremental BESS · 20 años con SOH). */
  evolucion: {
    labelDatasetPotenciaFirme: "Potencia firme estimada",
    labelDatasetOptimizacion: "Optimización horaria",
    leyendaPotenciaFirme: "Potencia firme estimada",
    leyendaOptimizacion: "Optimización horaria",
    /**
     * Líneas del tooltip al hover sobre el chart. El padding tras los `:`
     * se calibra para alinear los valores en columna fija dentro de los
     * tres labels nuevos. La línea de "Captura excedentes" se ajusta en
     * el componente para preservar alineación visual con los strings
     * más largos (24 chars vs los 21 originales).
     */
    tooltipPotenciaFirme: "  Potencia firme estimada:   ",
    tooltipOptimizacion: "  Optimización horaria:      ",
    tooltipCapturaExcedentes: "  Captura excedentes:        ",
    /**
     * Narrativa header del chart. "potencia firme proxy" → "potencia
     * firme estimada"; "arbitraje horario (optimización operativa)"
     * pierde el paréntesis redundante y queda "optimización horaria".
     */
    narrativa:
      "Las áreas apiladas son el aporte anual del BESS descompuesto en sus tres fuentes: potencia firme estimada (base estructural), optimización horaria y captura de excedentes (recuperación oportunista). La línea descendente es el SOH del catálogo Hyperstrong que erosiona el aporte año a año. La línea vertical marca el año del payback.",
  },

  /** Sección "Breakdown de ingresos". NO se renderiza hoy (decisión
   *  TabFinanciero); strings actualizados preventivamente para coherencia
   *  narrativa cuando/si se reactiva. */
  breakdown: {
    labelOptimizacion: "Optimización operativa horaria",
    labelPotenciaFirme: "Potencia firme estimada",
  },

  /** Sección "Flujo acumulado del BESS". */
  flujoAcumulado: {
    notaPie:
      "La línea verde es el flujo acumulado del aporte incremental del BESS (captura + optimización operativa + potencia firme − OPEX), partiendo de −CAPEX BESS en el año 0. Cruza cero en el año del payback. La línea gris punteada es el SFV existente como referencia visual; no contribuye al pago del CAPEX BESS.",
  },
} as const;

