import { useEffect, useMemo } from "react";

import { useParametrosPPA } from "@/hooks/useParametrosPPA";
import {
  calcularResumenCategorias,
  construirCategoriasDefault,
} from "@/lib/core/bess";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import type { DatosSFV } from "@/types/sfv";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

import { AnatomiaEnergiaChart } from "./AnatomiaEnergiaChart";
import { ParametrosPPA } from "./ParametrosPPA";
import { PuenteRecomendacion } from "./PuenteRecomendacion";
import { SelectorCategoria } from "./SelectorCategoria";

interface Props {
  datos: DatosSFV;
  seleccion: SeleccionCategoria;
  onSeleccionar: (s: SeleccionCategoria) => void;
  onResumenesChange: (r: ResumenCategoria[]) => void;
}

export function Seccion2EnergiaAlmacenable({
  datos,
  seleccion,
  onSeleccionar,
  onResumenesChange,
}: Props) {
  const { params, actualizar, resetearADefaults, promedioMensualSFV } =
    useParametrosPPA(datos);

  const resumenes = useMemo<ResumenCategoria[]>(() => {
    if (!params) return [];
    const cats = construirCategoriasDefault(params);
    return calcularResumenCategorias(datos.registros, cats);
  }, [datos, params]);

  useEffect(() => {
    onResumenesChange(resumenes);
  }, [resumenes, onResumenesChange]);

  if (!params) return null;

  const copy = COPY_M3.seccion2Energia;
  const totalSFV = datos.meta.total_energia_mwh;

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h2 className="text-xl font-medium text-ink-primary md:text-2xl">
          {copy.titulo}
        </h2>
        <p className="max-w-3xl text-sm text-ink-secondary md:text-base">
          {copy.intro(totalSFV)}
        </p>
      </header>

      <ParametrosPPA
        params={params}
        promedioMensualSFV={promedioMensualSFV}
        onActualizar={actualizar}
        onResetear={resetearADefaults}
      />

      <AnatomiaEnergiaChart
        resumenes={resumenes}
        totalSFV_mwh={totalSFV}
        seleccion={seleccion}
      />

      <SelectorCategoria
        seleccion={seleccion}
        onSeleccionar={onSeleccionar}
        resumenes={resumenes}
      />

      <PuenteRecomendacion seleccion={seleccion} resumenes={resumenes} />
    </section>
  );
}
