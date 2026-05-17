import type { RegistroHorario } from "@/types/sfv";
import type {
  CategoriaEnergia,
  ParametrosPPA,
  ResumenCategoria,
} from "@/types/bess";

/**
 * Para una categoría dada, devuelve el array horario (MWh) con cuánta energía
 * del SFV cae en esa categoría hora por hora.
 */
export function calcularEnergiaPorCategoria(
  registros: readonly RegistroHorario[],
  categoria: CategoriaEnergia
): number[] {
  switch (categoria.tipo) {
    case "toda_energia":
      return registros.map((r) => r.energia_mwh);

    case "fuera_hora_punta_cfe": {
      const [ini, fin] = categoria.ventana_punta;
      return registros.map((r) => {
        const horaEnding = r.timestamp.getHours() + 1;
        const enPunta = horaEnding >= ini && horaEnding <= fin;
        return enPunta ? 0 : r.energia_mwh;
      });
    }

    case "compromiso_ppa_mensual_mwh": {
      const totalPorMes = new Map<string, number>();
      for (const r of registros) {
        const key = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}`;
        totalPorMes.set(key, (totalPorMes.get(key) ?? 0) + r.energia_mwh);
      }
      return registros.map((r) => {
        const key = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}`;
        const totalMes = totalPorMes.get(key) ?? 0;
        if (totalMes <= categoria.mwh_mes) return 0;
        const fraccionLibre = (totalMes - categoria.mwh_mes) / totalMes;
        return r.energia_mwh * fraccionLibre;
      });
    }

    case "exceso_capacidad_cfe_kw":
      return registros.map((r) => {
        const exceso_kw = Math.max(0, r.potencia_kw_prom - categoria.techo_kw);
        return exceso_kw / 1000;
      });
  }
}

export function construirCategoriasDefault(
  params: ParametrosPPA
): CategoriaEnergia[] {
  const [ini, fin] = params.ventana_punta_cfe;
  return [
    {
      tipo: "toda_energia",
      etiqueta: "Toda la energía es candidata",
      descripcion:
        "Techo técnico: el máximo absoluto si no hubiera compromiso de PPA.",
    },
    {
      tipo: "fuera_hora_punta_cfe",
      ventana_punta: params.ventana_punta_cfe,
      etiqueta: "Energía fuera de hora-punta CFE",
      descripcion: `Energía generada fuera de la ventana ${ini}-${fin}h. Disponible para mover en el tiempo.`,
    },
    {
      tipo: "compromiso_ppa_mensual_mwh",
      mwh_mes: params.compromiso_mensual_mwh,
      etiqueta: "Energía arriba del compromiso PPA",
      descripcion: `Lo que tu SFV genera por encima de ${params.compromiso_mensual_mwh.toFixed(1)} MWh/mes comprometidos al offtaker.`,
    },
    {
      tipo: "exceso_capacidad_cfe_kw",
      techo_kw: params.capacidad_poi_kw,
      etiqueta: "Energía que excede capacidad CFE",
      descripcion: `Generación instantánea por encima de ${params.capacidad_poi_kw} kW. Para SFV no ampliado, típicamente cero.`,
    },
  ];
}

export function calcularResumenCategorias(
  registros: readonly RegistroHorario[],
  categorias: readonly CategoriaEnergia[]
): ResumenCategoria[] {
  const totalSFV = registros.reduce((s, r) => s + r.energia_mwh, 0);
  const mesesUnicos = new Set<string>();
  for (const r of registros) {
    mesesUnicos.add(`${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}`);
  }
  const nMeses = mesesUnicos.size;

  return categorias.map((cat) => {
    const arr = calcularEnergiaPorCategoria(registros, cat);
    const total = arr.reduce((s, v) => s + v, 0);
    return {
      categoria: cat,
      total_mwh: total,
      porcentaje: totalSFV > 0 ? (total / totalSFV) * 100 : 0,
      promedio_mensual_mwh: nMeses > 0 ? total / nMeses : 0,
    };
  });
}

export function calcularPromedioMensualSFV(
  registros: readonly RegistroHorario[]
): number {
  if (registros.length === 0) return 0;
  const total = registros.reduce((s, r) => s + r.energia_mwh, 0);
  const mesesUnicos = new Set<string>();
  for (const r of registros) {
    mesesUnicos.add(`${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}`);
  }
  return mesesUnicos.size > 0 ? total / mesesUnicos.size : 0;
}
