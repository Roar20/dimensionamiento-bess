export type EquipoBESS = {
  id: string;
  nombre_corto: string;
  nombre_completo: string;
  modelo: string;
  familia: "C&I" | "Utility";
  kw_ac: number;
  kwh: number;
  precio_usd: number;
  config_bateria: string;
  voltaje_dc: number;
  voltaje_op_min_dc: number;
  voltaje_op_max_dc: number;
  /** Fracción entre 0 y 1. */
  eficiencia_max: number;
  vida_util_anios: number;
  tipo_bateria: string;
  temperatura_op_min_c: number;
  temperatura_op_max_c: number;
  ancho_mm: number;
  profundidad_mm: number;
  alto_mm: number;
  peso_kg: number;
  ip_rating_bateria: string;
  ip_rating_gabinete: string;
  cooling_method: string;
  comunicaciones: readonly string[];
  certificaciones: readonly string[];
  datasheet_pdf: string;
};

export const CATALOGO_HYPERSTRONG: readonly EquipoBESS[] = [
  {
    id: "hypercube-plus",
    nombre_corto: "II Plus",
    nombre_completo: "HyperCube C&I II Plus",
    modelo: "HSL2E6922-0261-EU",
    familia: "C&I",
    kw_ac: 125,
    kwh: 261.2,
    precio_usd: 55997,
    config_bateria: "1P260S",
    voltaje_dc: 832,
    voltaje_op_min_dc: 702,
    voltaje_op_max_dc: 936,
    eficiencia_max: 0.91,
    vida_util_anios: 15,
    tipo_bateria: "LFP-314Ah",
    temperatura_op_min_c: -25,
    temperatura_op_max_c: 55,
    ancho_mm: 1030,
    profundidad_mm: 1350,
    alto_mm: 2400,
    peso_kg: 2600,
    ip_rating_bateria: "IP55",
    ip_rating_gabinete: "IP54",
    cooling_method: "Smart Liquid Cooling (Battery) / Smart Air Cooling (PCS)",
    comunicaciones: ["CAN", "Ethernet", "RS485"],
    certificaciones: [
      "IEC 61000",
      "IEC 62619",
      "IEC 63056",
      "IEC 62477",
      "IEC 62040",
      "IEC 62933",
      "IEC 60730",
      "VDE 4105",
      "VDE 4110",
      "UN38.3",
      "UL9540A",
    ],
    datasheet_pdf: "/datasheets/hypercube-plus.pdf",
  },
  {
    id: "hypercube-max",
    nombre_corto: "II Max",
    nombre_completo: "HyperCube C&I II Max",
    modelo: "HSL2E... (AC System version, 250 kVA)",
    familia: "C&I",
    kw_ac: 250,
    kwh: 835.9,
    precio_usd: 147726,
    config_bateria: "1P416S",
    voltaje_dc: 1331.2,
    voltaje_op_min_dc: 1123.2,
    voltaje_op_max_dc: 1497.6,
    eficiencia_max: 0.91,
    vida_util_anios: 12,
    tipo_bateria: "LFP-314Ah",
    temperatura_op_min_c: -25,
    temperatura_op_max_c: 55,
    ancho_mm: 1500,
    profundidad_mm: 2320,
    alto_mm: 2400,
    peso_kg: 5000,
    ip_rating_bateria: "IP55",
    ip_rating_gabinete: "IP54",
    cooling_method: "Smart Liquid Cooling",
    comunicaciones: ["CAN", "Ethernet", "RS485"],
    certificaciones: [
      "IEC 61000",
      "IEC 62619",
      "IEC 63056",
      "IEC 62477",
      "IEC 62040",
      "IEC 62933",
      "IEC 60730",
      "VDE 4105",
      "VDE 4110",
      "UN38.3",
      "UL9540A",
    ],
    datasheet_pdf: "/datasheets/hypercube-max.pdf",
  },
  {
    id: "hyperblock-iii",
    nombre_corto: "Block III",
    nombre_completo: "HyperBlock III DC Version",
    modelo: "HSL3C7001-05015",
    familia: "Utility",
    kw_ac: 2500,
    kwh: 5015.96,
    precio_usd: 565008,
    config_bateria: "12P416S",
    voltaje_dc: 1331.2,
    voltaje_op_min_dc: 1123.2,
    voltaje_op_max_dc: 1497.6,
    eficiencia_max: 0.93,
    vida_util_anios: 15,
    tipo_bateria: "LFP-314Ah",
    temperatura_op_min_c: -30,
    temperatura_op_max_c: 55,
    ancho_mm: 6058,
    profundidad_mm: 2438,
    alto_mm: 2896,
    peso_kg: 42000,
    ip_rating_bateria: "IP65",
    ip_rating_gabinete: "IP55",
    cooling_method: "Smart Liquid Cooling",
    comunicaciones: ["Ethernet", "RS485"],
    certificaciones: [
      "UN38.3",
      "IEC 61000",
      "IEC 62933-5-2",
      "IEC 62619",
      "IEC 60730",
      "IEC 63056",
      "IEC 62477",
      "UL9540A",
      "UL9540",
      "UL1973",
      "NFPA855",
      "NFPA68",
      "NFPA69",
      "UN3536",
    ],
    datasheet_pdf: "/datasheets/hyperblock-iii.pdf",
  },
];

export function costoPorKwh(equipo: EquipoBESS): number {
  return equipo.precio_usd / equipo.kwh;
}

export function densidadEnergetica(equipo: EquipoBESS): number {
  const area_m2 = (equipo.ancho_mm / 1000) * (equipo.profundidad_mm / 1000);
  return equipo.kwh / area_m2;
}

export function duracionNominalHoras(equipo: EquipoBESS): number {
  return equipo.kwh / equipo.kw_ac;
}

export function huellaEnSueloM2(equipo: EquipoBESS): number {
  return (equipo.ancho_mm / 1000) * (equipo.profundidad_mm / 1000);
}

export function buscarEquipo(id: string): EquipoBESS | null {
  return CATALOGO_HYPERSTRONG.find((e) => e.id === id) ?? null;
}
