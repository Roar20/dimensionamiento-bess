import { CURVAS_SOH } from "./curvas-soh";

export type ArquitecturaBess = "AC" | "DC" | "AC+DC";

export type EquipoBess = {
  id: "cube-plus" | "cube-max" | "block-iii";
  nombre: string;
  modelo: string;
  modeloDetalle: string;
  /** Lado eléctrico del equipo. Define cómo se conecta al POI. */
  arquitectura: ArquitecturaBess;
  energiaKwh: number;
  potenciaKvaAc: number | null;
  potenciaKwDc: number | null;
  eficienciaMax: string;
  vidaUtilAnos: string;
  configuracionCeldas: string;
  voltajeDcV: number;
  rangoVoltajeDcV: [number, number];
  dimensionesMm: [number, number, number];
  pesoKg: number;
  precioUsdUnidad: number;
  precioUsdKwh: number;
  temperaturaOpC: [number, number];
  refrigeracion: string;
  capacidadParaleloUnidades: number | null;
  rteGananciaPct: number | null;
  densidadGananciaPct: number | null;
  certificaciones: string[];
  datasheetUrl: string;
  aplicableTequila: boolean;
  curvaSoh: readonly number[];
};

export const CATALOGO_HYPERSTRONG: EquipoBess[] = [
  {
    id: "cube-plus",
    nombre: "HyperCube C&I II Plus",
    modelo: "HSL2E6922-0261-EU",
    modeloDetalle: "HSL2E6922-0261-EU",
    arquitectura: "AC",
    energiaKwh: 261.2,
    potenciaKvaAc: 125,
    potenciaKwDc: null,
    eficienciaMax: "91",
    vidaUtilAnos: ">15",
    configuracionCeldas: "1P260S",
    voltajeDcV: 832,
    rangoVoltajeDcV: [702, 936],
    dimensionesMm: [1030, 1350, 2400],
    pesoKg: 2600,
    precioUsdUnidad: 55997,
    precioUsdKwh: 214,
    temperaturaOpC: [-25, 55],
    refrigeracion: "Líquida (batería) · aire (PCS)",
    capacidadParaleloUnidades: 20,
    rteGananciaPct: null,
    densidadGananciaPct: null,
    certificaciones: ["IEC 62619", "IEC 63056", "UL9540A", "UN38.3"],
    datasheetUrl: "/datasheets/hypercube-plus.pdf",
    aplicableTequila: true,
    curvaSoh: CURVAS_SOH.hyperstrong_lfp_standard,
  },
  {
    id: "cube-max",
    nombre: "HyperCube C&I II Max",
    modelo: "250/430 kVA · AC/DC version",
    modeloDetalle: "250/430 kVA · AC/DC version",
    arquitectura: "AC+DC",
    energiaKwh: 835.9,
    potenciaKvaAc: 250,
    potenciaKwDc: null,
    eficienciaMax: ">91",
    vidaUtilAnos: ">12",
    configuracionCeldas: "1P416S",
    voltajeDcV: 1331,
    rangoVoltajeDcV: [1123, 1498],
    dimensionesMm: [1500, 2320, 2400],
    pesoKg: 5000,
    precioUsdUnidad: 147726,
    precioUsdKwh: 177,
    temperaturaOpC: [-25, 55],
    refrigeracion: "Líquida",
    capacidadParaleloUnidades: 20,
    rteGananciaPct: null,
    densidadGananciaPct: null,
    certificaciones: ["IEC 62619", "IEC 63056", "UL9540A", "UN38.3"],
    datasheetUrl: "/datasheets/hypercube-max.pdf",
    aplicableTequila: true,
    curvaSoh: CURVAS_SOH.hyperstrong_lfp_standard,
  },
  {
    id: "block-iii",
    nombre: "HyperBlock III",
    modelo: "HSL3C7001-05015",
    modeloDetalle: "HSL3C7001-05015 · DC version",
    arquitectura: "DC",
    energiaKwh: 5015.96,
    potenciaKvaAc: null,
    potenciaKwDc: 2500,
    eficienciaMax: "n/d",
    vidaUtilAnos: "n/d en datasheet",
    configuracionCeldas: "12P416S",
    voltajeDcV: 1331,
    rangoVoltajeDcV: [1123, 1498],
    dimensionesMm: [6058, 2438, 2896],
    pesoKg: 42000,
    precioUsdUnidad: 565008,
    precioUsdKwh: 113,
    temperaturaOpC: [-30, 55],
    refrigeracion: "Líquida",
    capacidadParaleloUnidades: null,
    rteGananciaPct: 2,
    densidadGananciaPct: 34.5,
    certificaciones: [
      "IEC 62619",
      "IEC 63056",
      "UL9540A",
      "UL9540",
      "UL1973",
      "NFPA855",
      "UN38.3",
    ],
    datasheetUrl: "/datasheets/hyperblock-iii.pdf",
    aplicableTequila: false,
    curvaSoh: CURVAS_SOH.hyperstrong_lfp_standard,
  },
];
