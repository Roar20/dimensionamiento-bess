import { useState } from "react";

import { ProjectContextHeader } from "@/components/shell/ProjectContextHeader";
import { FooterEstandar } from "@/components/ui/FooterEstandar";
import { LecturaEjecutiva } from "@/components/ui/LecturaEjecutiva";
import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";
import { useDatosSFV } from "@/hooks/useDatosSFV";
import { useTipoCambio } from "@/hooks/useTipoCambio";
import { CATALOGO_HYPERSTRONG, type EquipoBess } from "@/data/catalogo-hyperstrong";

import { ComparativaTecnica } from "./ComparativaTecnica";
import { CostoUnitarioBess } from "./CostoUnitarioBess";
import { EquipoCard } from "./EquipoCard";
import { FichaTecnicaModal } from "./FichaTecnicaModal";
import { SeccionDegradacionSOH } from "./SeccionDegradacionSOH";
import { TipoCambioInput } from "./TipoCambioInput";

const LECTURA_EJECUTIVA =
  "Tres plataformas Hyperstrong disponibles cubriendo el rango de 125 kW a 2,500 kW por unidad. Para el portafolio de Soluciones MHG (POI ≤ 500 kW por planta), Cube Plus y Cube Max son las opciones aplicables; Block III queda fuera de escala para este caso de uso.";

export function TabBessCatalogo() {
  const [equipoFicha, setEquipoFicha] = useState<EquipoBess | null>(null);
  const { tipoCambio, setTipoCambio } = useTipoCambio();
  const { datos } = useDatosSFV();

  const metaPlanta = datos
    ? {
        anio: datos.meta.anio,
        totalRegistros: datos.meta.total_horas,
        poiKw: datos.config.capacidad_poi_kw,
        zonaLmp: datos.config.zona_lmp,
      }
    : undefined;

  return (
    <div>
      <ProjectContextHeader
        titulo="Catálogo de almacenamiento — Hyperstrong"
        meta={metaPlanta}
        slotFinal={
          <TipoCambioInput valor={tipoCambio} onChange={setTipoCambio} />
        }
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
              tipoCambio={tipoCambio}
              onAbrirFicha={setEquipoFicha}
            />
          ))}
        </div>
      </section>

      <ComparativaTecnica />

      <CostoUnitarioBess />

      <SeccionDegradacionSOH />

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
          USD/MXN configurable inline en el header del catálogo. Default 20.00,
          persiste en este navegador. Cada precio del datasheet se muestra en
          USD con la conversión MXN debajo, recalculada en vivo.
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
