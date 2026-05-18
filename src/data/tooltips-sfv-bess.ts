/**
 * Tooltips de trazabilidad para Tab SFV+BESS. Filosofía: qué es y de
 * dónde viene. Una oración, sin pedagogía.
 */
export const TOOLTIPS_SFV_BESS = {
  energia_capturada:
    "Energía AC que el BESS absorbe del SFV durante el año, descontando " +
    "pérdidas de carga. Suma de cargado_kwh sobre las 8,760 horas del año base.",

  energia_despachada:
    "Energía AC que el BESS entrega a la red durante el año, descontando " +
    "pérdidas de descarga. Suma de descargado_kwh sobre las 8,760 horas.",

  fraccion_capturada:
    "Energía capturada ÷ energía disponible en la categoría seleccionada. " +
    "1.0 = el BESS captura todo; <1 = sobra energía sin lugar a dónde meterse.",

  ciclos_anuales:
    "Ciclos equivalentes en el año, calculados como descargado_total ÷ " +
    "(SoC máximo). Indicador para curva SOH y vida útil acelerada.",

  rte_efectivo:
    "Eficiencia round-trip observada: descargado ÷ cargado. Refleja " +
    "pérdidas reales en la operación, no solo la cifra del datasheet.",

  precio_energia:
    "MXN por MWh descargado al lado AC. Proxy Estanzuela 2 mientras se " +
    "confirma el precio del PPA de Tequila con el offtaker.",

  precio_potencia_firme:
    "MXN por MW de potencia firme acreditable por mes. Capturado para " +
    "demos; integración en próxima versión.",

  precio_cel:
    "Certificados de Energía Limpia: MXN por MWh descargado. Proxy mientras " +
    "se confirma el régimen CEL del contrato.",

  ingreso_anual:
    "Incluye energía + CELs. Potencia firme se integrará en próxima versión.",

  capex_mxn:
    "Conversión del CAPEX USD del datasheet al tipo de cambio configurado " +
    "en el header del catálogo BESS.",

  payback_preliminar:
    "CAPEX ÷ ingreso anual. Sin descuento, sin OPEX, sin SOH. Cálculo " +
    "financiero riguroso vive en Tab Análisis financiero.",

  arquitectura:
    "Lado eléctrico del equipo. AC inyecta directo al POI; DC requiere " +
    "PCS externo; AC+DC ofrece ambas variantes.",

  fuera_de_escala:
    "El equipo no tiene lado AC propio, por lo que no se simula sobre el POI " +
    "del proyecto. Reservado a portafolios utility con PCS externo.",
} as const;
