interface Props {
  titulo: string;
  chips: { icono: string; texto: string }[];
}

/**
 * Variante minimal del HeaderDossier para tabs independientes de planta
 * (sin estado de planta, sin botón "Cambiar planta"). Reusa tipografía
 * y spacing del HeaderDossier: h1 24/medium/-0.01em + chips Tabler.
 *
 * Vive en `bess/` porque hoy solo lo usa Tab BESS. Si aparece un segundo
 * consumidor en otra tab, mover a `src/components/ui/`.
 */
export function HeaderCatalogo({ titulo, chips }: Props) {
  return (
    <header className="mb-8">
      <h1 className="mb-1.5 text-2xl font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
        {titulo}
      </h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
        {chips.map((chip, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5">
            <i
              className={`ti ${chip.icono} text-[var(--color-text-tertiary)]`}
              aria-hidden="true"
            />
            {chip.texto}
          </span>
        ))}
      </div>
    </header>
  );
}
