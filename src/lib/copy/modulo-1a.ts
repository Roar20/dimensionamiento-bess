export const COPY_M1A = {
  hero: {
    titulo: "Nuevo proyecto",
  },
  secciones: {
    cliente: {
      numero: "1",
      titulo: "Identificación",
      campos: {
        nombre: {
          label: "Nombre de la planta",
          placeholder: "Ej. Tequila 1",
        },
        cliente: {
          label: "Cliente",
          placeholder: "Ej. Soluciones MHG, S.A. de C.V.",
        },
        ubicacion: {
          label: "Ubicación",
          placeholder: "Ej. Tequila, Jalisco, México",
        },
      },
    },
    contractuales: {
      numero: "2",
      titulo: "Parámetros contractuales",
      campos: {
        poi: {
          label: "Capacidad CFE (kW)",
          placeholder: "Ej. 500",
        },
        instalada: {
          label: "Capacidad SFV instalada (kW)",
          placeholder: "Ej. 500",
        },
        zonaLmp: {
          label: "Zona LMP",
          placeholder: "Ej. MINAS",
        },
        precioPpa: {
          label: "Precio PPA (MXN/MWh)",
          placeholder: "Ej. 1010.80",
        },
      },
    },
    archivo: {
      numero: "3",
      titulo: "Archivo de generación",
      descripcion:
        "Excel (.xlsx) · Día de Operación · Hora (1-24) · Energía Registrada [MWh]",
      dropzone: {
        instruccion: "Arrastra el .xlsx o haz clic para seleccionar",
        botonSeleccionar: "Seleccionar archivo",
        formatoNoValido:
          "El archivo debe ser un Excel (.xlsx). Selecciona otro archivo.",
      },
    },
  },
  acciones: {
    procesar: "Procesar y ver reporte",
    procesando: "Procesando archivo…",
    cargarAnterior: "Cargar análisis anterior",
    borrar: "Borrar datos guardados",
    confirmarBorrar: {
      titulo: "¿Borrar los datos guardados?",
      descripcion:
        "Vamos a eliminar la configuración y el archivo persistidos en este navegador. Esta acción no se puede deshacer.",
      cancelar: "Cancelar",
      confirmar: "Sí, borrar",
    },
  },
  resumen: {
    titulo: "Análisis cargado",
    subtitulo:
      "Estos son los datos persistidos en este navegador. Puedes seguir trabajando o cargar otra planta.",
    cambiar: "Cargar otra planta",
    kpis: {
      anio: { label: "Año del reporte", sublabel: "Inferido del archivo" },
      energiaAnual: {
        label: "Energía anual generada",
        sublabel: "Suma del periodo cargado",
        unidad: "MWh",
      },
      horasConGen: {
        label: "Horas con generación",
        sublabel: "Horas con energía mayor a cero",
      },
      pico: {
        label: "Pico horario",
        sublabel: "Potencia promedio máxima en una hora",
        unidad: "kW",
      },
    },
  },
  // Conservado para `CajaComoFunciona.tsx`, no renderizado en el onboarding
  // (ver docs/MIGRATION_NOTES.md). Candidato a eliminación.
  como: {
    titulo: "Cómo funciona",
    pasos: [
      "Procesamos el archivo y caracterizamos el comportamiento real de la planta.",
      "Los análisis del SFV solo, del BESS, del SFV + BESS y financiero se habilitan en los siguientes módulos del simulador.",
      "Toda la información se guarda en este navegador. No se sube nada a un servidor.",
    ],
  },
  validaciones: {
    nombreRequerido: "Captura el nombre de la planta para continuar.",
    poiRequerido: "Captura la capacidad autorizada por CFE en kW.",
    instaladaRequerida: "Captura la capacidad instalada actual en kW.",
    numeroPositivo: "Usa un número mayor a cero.",
    archivoRequerido: "Sube el archivo de generación para continuar.",
  },
  errores: {
    titulo: "No pudimos procesar el archivo",
  },
};
