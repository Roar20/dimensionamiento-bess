import type { TabNavItem } from "@/components/ui/TabNav";
import { TabNav } from "@/components/ui/TabNav";

const NAV_ITEMS_FACTORY = (hayDatos: boolean): TabNavItem[] => [
  { label: "SFV", ruta: "/sfv", habilitado: hayDatos, tooltip: "Carga un archivo para habilitar el análisis" },
  // Catálogo Hyperstrong independiente del estado de planta: siempre habilitada.
  { label: "BESS", ruta: "/bess", habilitado: true },
  { label: "SFV + BESS", ruta: "/sfv-bess", habilitado: hayDatos, tooltip: "Carga un archivo para habilitar el análisis" },
  { label: "Análisis financiero", ruta: "/financiero", habilitado: hayDatos, tooltip: "Carga un archivo para habilitar el análisis" },
];

interface Props {
  hayDatos: boolean;
}

/**
 * Wrapper que arma la lista canónica de tabs y la pasa a `<TabNav>`.
 * Cada página la renderiza arriba del contenido (estilo mockup P0).
 */
export function PageHeader({ hayDatos }: Props) {
  return <TabNav items={NAV_ITEMS_FACTORY(hayDatos)} />;
}
