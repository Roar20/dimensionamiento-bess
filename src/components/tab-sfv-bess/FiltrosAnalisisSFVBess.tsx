import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import type { CategoriaEnergia } from "@/types/bess";

interface Props {
  categorias: readonly CategoriaEnergia[];
  categoriaTipo: CategoriaEnergia["tipo"];
  onCambiarCategoria: (tipo: CategoriaEnergia["tipo"]) => void;
}

export function FiltrosAnalisisSFVBess({
  categorias,
  categoriaTipo,
  onCambiarCategoria,
}: Props) {
  const copy = COPY_SFV_BESS.filtrosAnalisis;
  return (
    <div
      data-testid="filtros-analisis"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border-[0.5px] border-[var(--color-border-light)] bg-white px-4 py-2.5 text-[12px]"
    >
      <span className="text-[var(--color-text-secondary)]">
        {copy.prefacio}
      </span>
      <span className="text-[var(--color-text-tertiary)]">·</span>
      <label className="inline-flex items-center gap-2">
        <span className="text-[var(--color-text-secondary)]">
          {copy.labelCategoria}:
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
    </div>
  );
}
