export const COPY_M1A = {
  hero: {
    titulo: "Simulador BESS — Onboarding del proyecto",
    subtitulo:
      "Sube el reporte de generación del cliente y configura los parámetros contractuales de la planta.",
  },
  secciones: {
    cliente: {
      numero: "1",
      titulo: "Datos del cliente",
      descripcion:
        "Identifica la planta y, si quieres, agrega el cliente y la ubicación.",
      campos: {
        nombre: {
          label: "Nombre de la planta",
          helper: "Identificador del SFV en tu portafolio.",
          placeholder: "Ej. Tequila 1",
        },
        cliente: {
          label: "Cliente",
          helper: "Razón social del operador.",
          placeholder: "Ej. Soluciones MHG, S.A. de C.V.",
        },
        ubicacion: {
          label: "Ubicación",
          helper: "Municipio y estado.",
          placeholder: "Ej. Tequila, Jalisco, México",
        },
      },
    },
    contractuales: {
      numero: "2",
      titulo: "Parámetros contractuales",
      descripcion:
        "Capacidad autorizada por CFE, capacidad instalada actual y, si lo tienes, el precio del contrato PPA.",
      campos: {
        poi: {
          label: "Capacidad autorizada por CFE (kW)",
          helper: "Capacidad de interconexión autorizada por CFE.",
          placeholder: "Ej. 500",
        },
        instalada: {
          label: "Capacidad instalada actual (kW)",
          helper: "Capacidad fotovoltaica de hoy.",
          placeholder: "Ej. 500",
        },
        zonaLmp: {
          label: "Zona LMP",
          helper: "Zona de precio del mercado eléctrico (CENACE).",
          placeholder: "Ej. MINAS",
        },
        precioPpa: {
          label: "Precio PPA (MXN/MWh)",
          helper:
            "Si lo tienes, puedes capturarlo ahora; si no, lo agregamos después.",
          placeholder: "Ej. 1010.80",
        },
      },
    },
    archivo: {
      numero: "3",
      titulo: "Archivo de generación",
      descripcion:
        "Formato esperado: Excel (.xlsx) con las columnas Día de Operación, Hora (1-24) y Energía Registrada [MWh]. Reporte anual o mensual.",
      dropzone: {
        instruccion:
          "Arrastra el archivo aquí o haz clic para seleccionar",
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
