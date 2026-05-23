/**
 * Copy oficial del Tab Análisis Financiero. Ver `docs/COPY.md` §
 * "Módulo Tab Análisis Financiero — Entrega 1a".
 *
 * Convención del repo: ningún string visible al usuario va hardcodeado
 * en JSX. Cada label/sublabel/tooltip que el cliente lee se declara
 * acá y se importa desde el componente.
 *
 * Naturaleza ejecutiva: lenguaje llano, sin acrónimos crudos
 * (LMP/GDMTH/WACC/PML solo donde sean necesarios como label técnico
 * acompañado de tooltip explicativo).
 */
export const COPY_TAB_FINANCIERO = {
  /** Hero / KPIs principales del Tab Análisis Financiero. */
  hero: {
    aporteBess: {
      label: "Aporte operativo estimado",
      sublabel:
        "Incluye captura energética y aporte a potencia firme, antes de costos de operación.",
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
} as const;
