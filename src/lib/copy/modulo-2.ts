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
      semestral: "Semestral",
      trimestral: "Trimestral",
      mensual: "Mensual",
      semanal: "Semanal",
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
      titulo: "Detalle técnico — HSE y factor de capacidad",
      tooltip:
        "HSE (Horas Sol Equivalentes): cuántas horas equivalentes de sol pleno produjo tu SFV al día. Un valor de 5 h/día es típico para México central. Factor de capacidad: cuán aprovechada está la capacidad instalada del SFV (independiente del POI).",
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
      tooltip:
        "Clipping físico: cuando el inversor del SFV recorta la generación porque excedería la capacidad autorizada por CFE. En tu caso (capacidad PV = capacidad CFE), no debería ocurrir nunca; si aparece, indica una anomalía en el inversor.",
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
      titulo: "Detalle técnico — distribución de días por rango de energía",
      tooltip:
        "Histograma: agrupa los días del periodo en rangos de energía generada. Una distribución concentrada en pocos rangos indica un recurso solar estable; una distribución dispersa indica alta variabilidad día a día.",
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
      titulo: "Detalle técnico — matriz numérica del heatmap",
      tooltip:
        "Cada celda muestra la potencia promedio (kW) que el SFV produjo en esa hora de ese día. Útil para identificar patrones de generación día por día.",
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
  calidadDataset: {
    titulo: "Calidad del dataset",
    cobertura: {
      label: "Cobertura temporal",
      tooltip:
        "Registros recibidos vs registros esperados para un año completo. Sirve para detectar archivos con huecos o rangos parciales. Año bisiesto considera 8,784 horas en lugar de 8,760.",
      nota: (recibidos: number, esperados: number) =>
        `${recibidos.toLocaleString("es-MX")} / ${esperados.toLocaleString(
          "es-MX"
        )} registros`,
    },
    diasConGeneracion: {
      label: "Días con generación",
      tooltip:
        "Días del año con al menos un registro de generación > 0. Días sin registro o con generación nula completa cuentan como inactivos.",
      nota: (pct: number) => `${pct.toFixed(1)}% del calendario`,
    },
    anomalias: {
      label: "Anomalías detectadas",
      tooltip:
        "Días con caída de generación > 30% respecto al promedio móvil simétrico de 7 días. Es una señal de revisión, no un diagnóstico — no descuenta estacionalidad ni nubosidad típica.",
      sufijoDias: (n: number) => (n === 1 ? "día" : "días"),
      sinAnomalias: "Sin anomalías detectadas",
      listaConExceso: (mostradas: string, restantes: number) =>
        `${mostradas} · +${restantes} más`,
      detalleToggle: (n: number) =>
        n === 1 ? "Ver detalle de la 1 fecha" : `Ver detalle de las ${n} fechas`,
      tablaHeader: {
        fecha: "Fecha",
        energiaDia: "Generación diaria",
        baseline: "Promedio 7d",
        variacion: "Variación",
      },
    },
    granularidad: {
      label: "Granularidad",
      tooltip:
        "Intervalo entre registros consecutivos. Granularidad horaria suaviza picos por integración temporal; granularidades finas preservan picos instantáneos.",
      notaHoraria: "Suavizado por integración horaria",
      notaSubhoraria: "Preserva picos instantáneos",
    },
  },
  perfilHorario: {
    ventanaCFE: {
      label: "Hora punta CFE",
      leyenda: "Ventana hora-punta CFE",
    },
  },
} as const;
