import { useState } from "react";

import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { LecturaEjecutiva } from "@/components/ui/LecturaEjecutiva";
import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";
import { CATALOGO_HYPERSTRONG, type EquipoBess } from "@/data/catalogo-hyperstrong";

import { ComparativaTecnica } from "./ComparativaTecnica";
import { EquipoCard } from "./EquipoCard";
import { FichaTecnicaModal } from "./FichaTecnicaModal";
import { HeaderCatalogo } from "./HeaderCatalogo";

const CHIPS_HEADER = [
  { icono: "ti-square-rotated", texto: "LFP-314Ah" },
  { icono: "ti-snowflake", texto: "Refrigeración líquida" },
  { icono: "ti-shield-check", texto: "UL9540A · IEC 62619" },
  { icono: "ti-currency-dollar", texto: "TC 20 MXN/USD" },
];

const LECTURA_EJECUTIVA =
  "Tres plataformas Hyperstrong disponibles cubriendo el rango de 125 kW a 2,500 kW por unidad. Para el portafolio de Soluciones MHG (POI ≤ 500 kW por planta), Cube Plus y Cube Max son las opciones aplicables; Block III queda fuera de escala para este caso de uso.";

export function TabBessCatalogo() {
  const [equipoFicha, setEquipoFicha] = useState<EquipoBess | null>(null);

  return (
    <div>
      <HeaderCatalogo
        titulo="Catálogo de almacenamiento — Hyperstrong"
        chips={CHIPS_HEADER}
      />

      <LecturaEjecutiva texto={LECTURA_EJECUTIVA} />

      <section className="mb-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
          Equipos disponibles
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATALOGO_HYPERSTRONG.map((equipo) => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onAbrirFicha={setEquipoFicha}
            />
          ))}
        </div>
      </section>

      <ComparativaTecnica />

      <MetodologiaDetalles titulo="Parámetros de operación y supuestos">
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Eficiencia round-trip (RTE):
          </strong>{" "}
          85% sobre el sistema completo (batería + PCS + auxiliares), no sobre
          el PCS aislado. Convención consultor para dimensionamiento conservador.
        </p>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            DoD y SoC:
          </strong>{" "}
          profundidad de descarga 95%, SoC mínimo 5%, SoC inicial 5%. La
          ventana operativa útil del banco es 5%–100% del nominal declarado por
          datasheet.
        </p>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Curva SOH a 20 años:
          </strong>{" "}
          según Hyperstrong, retención 99.4% en el año 0 con caída suave hasta
          67.1% al año 20 (perfil LFP-314Ah, operación a 1C). Los cálculos
          financieros de Tab SFV+BESS aplican esta curva en lugar de un
          fade lineal.
        </p>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Cube Max — versión 250 kVA:
          </strong>{" "}
          el datasheet ofrece variantes 250 y 430 kVA. Por defecto se asume la
          versión 250 kVA (conservadora) hasta confirmar con proveedor el
          modelo cotizable para el portafolio.
        </p>
        <p>
          <strong className="font-medium text-[var(--color-text-primary)]">
            Tipo de cambio:
          </strong>{" "}
          USD/MXN 20.00 configurable por planta. Los precios del catálogo se
          mantienen en USD; la conversión a MXN ocurre en Tab Financiero.
        </p>
      </MetodologiaDetalles>

      <FooterEstandar
        fuente="Fuente: datasheets Hyperstrong · cotizaciones Soluciones MHG"
      />

      <FichaTecnicaModal
        equipo={equipoFicha}
        abierto={equipoFicha !== null}
        onOpenChange={(open) => {
          if (!open) setEquipoFicha(null);
        }}
      />
    </div>
  );
}
