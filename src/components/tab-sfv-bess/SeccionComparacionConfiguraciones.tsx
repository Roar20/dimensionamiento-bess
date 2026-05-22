import { useMemo } from "react";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import { DOD_DEFAULT } from "@/lib/core/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { useDatosSFV } from "@/hooks/useDatosSFV";
import type { CategoriaEnergia, EstrategiaDespacho } from "@/types/bess";
import type { RegistroHorario } from "@/types/sfv";

import { BandaContextoArchivo } from "./BandaContextoArchivo";
import { TablaConfiguraciones } from "./TablaConfiguraciones";

/**
 * RTE genérico C&I para el barrido de configuraciones.
 * El barrido usa un RTE genérico C&I para comparar tamaños abstractos;
 * no representa un equipo específico del catálogo. La sección principal
 * del tab usa el RTE del equipo (0.91 para Cube Plus); esa diferencia
 * es intencional — aquí se compara el ESPACIO de configuraciones, no
 * un hardware concreto.
 */
const RTE_CI_DEFAULT = 0.85;

interface Props {
  registros: readonly RegistroHorario[];
  categoriaActiva: CategoriaEnergia;
  estrategia: EstrategiaDespacho;
}

export function SeccionComparacionConfiguraciones({
  registros,
  categoriaActiva,
  estrategia: _estrategia,
}: Props) {
  const { metadataArchivo } = useDatosSFV();

  const resultado = useMemo(
    () =>
      correrBarridoConfiguraciones(
        registros,
        { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
        categoriaActiva,
        ["greedy", "arbitraje"],
        { dod: DOD_DEFAULT, rte: RTE_CI_DEFAULT, soc_inicial_kwh: 0 }
      ),
    [registros, categoriaActiva]
  );

  const copy = COPY_SFV_BESS.comparacionConfiguraciones;

  return (
    <section className="mb-8">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {copy.seccionLabel}
      </p>
      <div className="mb-4">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {copy.titulo}
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          {copy.subtitulo}
        </p>
      </div>

      <BandaContextoArchivo metadataArchivo={metadataArchivo} />

      <TablaConfiguraciones resultado={resultado} />

      <p className="mt-3 text-[11px] text-[var(--color-text-tertiary)]">
        {copy.nota}
      </p>
    </section>
  );
}
