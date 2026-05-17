export const COPY_M2 = {
  encabezado: {
    registrosHorarios: (n: number) => `${n.toLocaleString("es-MX")} registros horarios`,
    cargado: (fecha: string) => `cargado ${fecha}`,
    botonCambiar: "Cambiar planta",
  },
  modalCambiar: {
    titulo: "¿Quieres cambiar de planta?",
    descripcion:
      "Los datos actuales se reemplazarán al cargar el nuevo archivo.",
    cancelar: "Cancelar",
    continuar: "Continuar",
  },
  selectorTemporal: {
    label: "Periodo:",
    anterior: "Periodo anterior",
    siguiente: "Periodo siguiente",
    granularidad: {
      anual: "Anual",
      mensual: "Mensual",
      diario: "Diario",
    },
  },
  periodoSinDatos: {
    titulo: (label: string) => `No hay generación registrada el ${label}.`,
    ayuda: "Selecciona otro día o cambia la granularidad.",
    botonAnterior: "Ver día anterior con datos",
  },
  seccion1: {
    titulo: (periodo: string) => `1. ¿Cuánto genera tu SFV en ${periodo}?`,
    energia: {
      label: "Energía generada",
      sublabel: (periodo: string) => `En ${periodo}`,
      tooltip: "Suma de la energía registrada en el periodo seleccionado.",
    },
    horas: {
      label: "Horas con generación",
      sublabel: (totalHoras: number) =>
        `De ${totalHoras.toLocaleString("es-MX")} h del periodo`,
      tooltip:
        "Horas con producción mayor a cero. Un día completo de sol son ~5 horas equivalentes.",
    },
    pico: {
      label: "Potencia promedio anual del SFV",
      sublabel: (pctPoi: number) => `${pctPoi.toFixed(2)}% del POI`,
      tooltip:
        "Potencia máxima registrada en una hora durante el periodo.",
    },
    factorPlanta: {
      label: "Factor de planta",
      sublabel: "Utilización del POI",
      tooltip:
        "Qué tan aprovechada está la capacidad de interconexión autorizada por CFE. Un factor de planta típico para SFV en México es 18-25%.",
    },
    tecnico: {
      titulo: "Detalle técnico",
      hse: "Horas sol equivalentes diarias (HSE)",
      factorCap: "Factor de capacidad PV",
      diasAnalizados: "Días analizados",
    },
  },
  seccion2: {
    titulo: "2. ¿Cuándo genera durante el día?",
    grafica: {
      ejeXLabel: "Hora del día (1-24)",
      ejeYLabel: "kW",
      seriePromedio: "kW promedio",
      serieMax: "kW máximo",
      bandaPunta: "Hora-punta CFE",
      referenciaPoi: (kw: number) => `Capacidad POI: ${kw} kW`,
    },
    kpiEnergiaPunta: {
      label: "Energía generada durante hora-punta CFE",
      tooltip:
        "Porcentaje de la energía del SFV que coincide con el horario donde la electricidad vale más (18-22h según tarifa CFE GDMTH). Cuando es bajo, hay oportunidad de mover energía a esas horas con un BESS.",
    },
    tecnico: {
      titulo: "Detalle técnico — tabla horaria y clipping",
      tabla: {
        hora: "Hora",
        promedio: "kW promedio",
        maximo: "kW máximo",
      },
      clipping: {
        sinClipping:
          "No se detectó clipping físico en el periodo. Tu SFV opera siempre por debajo de la capacidad CFE.",
        conClipping: (horas: number, dias: number) =>
          `Se detectaron ${horas} horas de clipping físico en ${dias} día${dias === 1 ? "" : "s"}. El SFV alcanzó el techo del POI.`,
      },
    },
  },
  seccion3: {
    titulo: "3. ¿Cómo varía día a día?",
    serieLabel: "MWh por día",
    promedioLabel: (mwh: number) => `Promedio: ${mwh.toFixed(2)} MWh`,
    p10Label: (mwh: number) => `P10: ${mwh.toFixed(2)} MWh`,
    kpis: {
      mejorDia: {
        label: "Mejor día",
        tooltip: "Día con mayor generación del periodo.",
      },
      peorDia: {
        label: "Peor día",
        tooltip:
          "Día con menor generación del periodo (no necesariamente nulo).",
      },
      promedio: {
        label: "Promedio diario",
        tooltip: "Energía promedio generada por día durante el periodo.",
      },
      variabilidad: {
        label: "Variabilidad",
        tooltip:
          "Qué tanto varía la generación día a día. Valores bajos (<20%) indican un recurso estable.",
      },
      diasAnomalos: {
        label: "Días anómalos",
        tooltip:
          "Días con generación inusualmente baja (P10 inferior). Típicamente nublados o con falla de equipo.",
      },
    },
    tecnico: {
      titulo: "Histograma de días por rango de MWh",
      explicacion:
        "Esta distribución te muestra qué tan repetible es la generación diaria. Una distribución concentrada en pocos rangos indica un recurso estable; una distribución dispersa indica alta variabilidad.",
    },
  },
  seccion4: {
    titulo: "4. ¿Cuándo genera más, hora por hora y día por día?",
    selectorMes: "Mes a explorar",
    leyendaMin: "0 kW",
    leyendaMax: (kw: number) => `${Math.round(kw)} kW`,
    detalleDia: "Curva del día seleccionado",
    tecnico: {
      titulo: "Detalle técnico — matriz numérica (kW)",
    },
  },
  seccion5: {
    titulo: "5. Resumen mensual",
    descripcion:
      "Resumen ejecutivo por mes. Útil si necesitas copiar la información a tu reporte interno o presentación.",
    tabla: {
      mes: "Mes",
      energia: "Energía (MWh)",
      pico: "Pico horario (kW)",
      dias: "Días con generación",
      horaPico: "Hora pico promedio",
      mejorDia: "Mejor día",
      peorDia: "Peor día",
      sinDato: "—",
    },
    tecnico: {
      titulo: "Exportar resumen",
      boton: "Exportar CSV",
    },
  },
  bloqueTecnico: {
    abrir: "Mostrar detalle técnico",
    cerrar: "Ocultar detalle técnico",
  },
} as const;
