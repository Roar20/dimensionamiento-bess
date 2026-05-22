import { useMemo, useState } from "react";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import { DOD_DEFAULT } from "@/lib/core/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { useDatosSFV } from "@/hooks/useDatosSFV";
import { calcularResumenBarrido } from "@/lib/tab-sfv-bess/comparacion-configuraciones";
import type { CategoriaEnergia } from "@/types/bess";
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
}

export function SeccionComparacionConfiguraciones({
  registros,
  categoriaActiva,
}: Props) {
  const { metadataArchivo } = useDatosSFV();
  const [expandida, setExpandida] = useState(false);

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

  const resumen = useMemo(
    () => calcularResumenBarrido(resultado),
    [resultado]
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

      {!expandida && (
        <div
          data-testid="resumen-colapsado"
          className="mb-3 rounded-[10px] border-[0.5px] border-[var(--color-border-light)] bg-white px-4 py-3"
        >
          <p className="text-[13px] text-[var(--color-text-primary)]">
            {copy.colapso.resumen(
              resumen.numConfiguraciones,
              resumen.capturaMinPct,
              resumen.capturaMaxPct
            )}
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
            {copy.colapso.lineaMetodologica}
          </p>
        </div>
      )}

      <button
        type="button"
        data-testid="cta-toggle-tabla"
        aria-expanded={expandida}
        aria-controls="tabla-configuraciones-region"
        onClick={() => setExpandida((v) => !v)}
        className="mb-3 inline-flex h-8 items-center rounded-md border-[0.5px] border-[var(--color-border-medium)] bg-white px-3 text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-page)] focus:outline-none focus-visible:border-[var(--color-primary)]"
      >
        {expandida
          ? copy.colapso.ctaColapsar
          : copy.colapso.ctaExpandir(resumen.numConfiguraciones)}
      </button>

      <div id="tabla-configuraciones-region" hidden={!expandida}>
        {expandida && <TablaConfiguraciones resultado={resultado} />}
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-tertiary)]">
        {copy.nota}
      </p>
      <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
        {copy.notaEficiencia}
      </p>
    </section>
  );
}
