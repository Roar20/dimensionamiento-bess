import type {
  ConfiguracionBESS,
  ResultadoSimulacion,
} from "@/types/bess";
import type { EquipoBESS } from "@/lib/bess/catalogo-hyperstrong";
import type { ComparativaEstrategias } from "./recomendar-estrategia";

export function generarResumenEjecutivo(args: {
  totalEnergiaSFV_mwh: number;
  equipo: EquipoBESS;
  multiplicador: number;
  config: ConfiguracionBESS;
  simArbitraje: ResultadoSimulacion;
  comparativa: ComparativaEstrategias;
  poi_kw: number;
  periodoLabel: string;
}): string[] {
  const {
    totalEnergiaSFV_mwh,
    equipo,
    multiplicador,
    config,
    simArbitraje,
    comparativa,
    poi_kw,
    periodoLabel,
  } = args;

  const nombreConfig =
    multiplicador === 1
      ? equipo.nombre_corto
      : `${multiplicador}× ${equipo.nombre_corto}`;

  const categoria = simArbitraje.categoria;
  const cargado = Math.round(simArbitraje.kpis.cargado_total_mwh);
  const horasPunta = simArbitraje.kpis.horas_descarga_en_punta;
  const ciclos = Math.round(simArbitraje.kpis.ciclos_periodo);
  const ratioPunta =
    comparativa.energia_punta_greedy_mwh > 0
      ? comparativa.energia_punta_arbitraje_mwh /
        comparativa.energia_punta_greedy_mwh
      : null;

  const bullets: string[] = [];

  bullets.push(
    `Tu SFV genera ${Math.round(totalEnergiaSFV_mwh).toLocaleString("es-MX")} MWh en ${periodoLabel}.`
  );

  bullets.push(
    `Con ${nombreConfig} (${Math.round(config.p_kw).toLocaleString("es-MX")} kW × ${Math.round(config.e_kwh).toLocaleString("es-MX")} kWh), el BESS captura ${cargado.toLocaleString("es-MX")} MWh bajo la categoría "${categoria.etiqueta}".`
  );

  if (ratioPunta !== null && ratioPunta > 1) {
    bullets.push(
      `La estrategia arbitraje entrega ${horasPunta.toLocaleString("es-MX")} horas de descarga en hora-punta CFE, ${ratioPunta.toFixed(1)}× más que greedy.`
    );
  } else {
    bullets.push(
      `La estrategia arbitraje entrega ${horasPunta.toLocaleString("es-MX")} horas de descarga en hora-punta CFE.`
    );
  }

  bullets.push(
    `El BESS completa ${ciclos.toLocaleString("es-MX")} ciclos en el periodo — saludable para vida útil >12 años con química LFP.`
  );

  bullets.push(
    `Ninguna modificación a tu permiso CFE: la capacidad de interconexión se mantiene en ${poi_kw.toLocaleString("es-MX")} kW.`
  );

  return bullets;
}
