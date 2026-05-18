import type { EquipoBess } from "@/data/catalogo-hyperstrong";

/**
 * Un equipo queda "fuera de escala" para un POI dado si no tiene lado AC
 * (`potenciaKvaAc === null`). Equipos DC-version no inyectan al POI sin
 * un PCS externo; el catálogo presentacional los muestra pero no entran
 * a la simulación SFV+BESS.
 *
 * Esta función es independiente del valor numérico de POI: hoy, el
 * criterio único es presencia de lado AC. Si en el futuro se añade un
 * límite por kVA, se extiende aquí.
 */
export function esFueraDeEscala(equipo: EquipoBess): boolean {
  return equipo.potenciaKvaAc === null;
}

/**
 * Razón canónica del fuera de escala. Usada en banners y tooltips.
 */
export function razonFueraDeEscala(equipo: EquipoBess): string | null {
  if (equipo.potenciaKvaAc === null) {
    return "Equipo de escala utility. Aplicable a portafolios con POI > 1 MW.";
  }
  return null;
}
