import type { CategoriaEnergia, EstrategiaDespacho } from "@/types/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  categorias: readonly CategoriaEnergia[];
  categoriaTipo: CategoriaEnergia["tipo"];
  onCambiarCategoria: (tipo: CategoriaEnergia["tipo"]) => void;
  estrategia: EstrategiaDespacho;
  onCambiarEstrategia: (e: EstrategiaDespacho) => void;
}

export function SelectoresComparativa({
  categorias,
  categoriaTipo,
  onCambiarCategoria,
  estrategia,
  onCambiarEstrategia,
}: Props) {
  const copy = COPY_SFV_BESS.comparativaEquipos;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 text-[12px]">
      <label className="inline-flex items-center gap-2">
        <span className="text-[var(--color-text-secondary)]">
          {copy.headerCategoria}:
        </span>
        <select
          value={categoriaTipo}
          onChange={(e) =>
            onCambiarCategoria(e.target.value as CategoriaEnergia["tipo"])
          }
          className="h-7 rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-[12px] text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
        >
          {categorias.map((c) => (
            <option key={c.tipo} value={c.tipo}>
              {c.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-2">
        <span className="text-[var(--color-text-secondary)]">
          {copy.headerEstrategia}:
        </span>
        <select
          value={estrategia}
          onChange={(e) =>
            onCambiarEstrategia(e.target.value as EstrategiaDespacho)
          }
          className="h-7 rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-[12px] text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
        >
          <option value="greedy">{COPY_SFV_BESS.estrategias.greedy}</option>
          <option value="arbitraje">
            {COPY_SFV_BESS.estrategias.arbitraje}
          </option>
        </select>
      </label>
    </div>
  );
}
