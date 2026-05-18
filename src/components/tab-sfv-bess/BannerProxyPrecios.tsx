import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  esProxy: boolean;
  onReset: () => void;
}

/**
 * Banda discreta arriba del panel de precios. Cuando los precios están en
 * defaults (Estanzuela 2), muestra el aviso y un reset deshabilitado.
 * Cuando el usuario los editó, habilita el reset para volver a defaults.
 */
export function BannerProxyPrecios({ esProxy, onReset }: Props) {
  const copy = COPY_SFV_BESS.paneles.precios;
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-[12px] text-[var(--color-text-secondary)]">
        {copy.banner}
      </p>
      <button
        type="button"
        onClick={onReset}
        disabled={esProxy}
        className="text-[12px] text-[var(--color-text-secondary)] underline-offset-2 transition-colors hover:text-[var(--color-text-primary)] hover:underline disabled:cursor-default disabled:text-[var(--color-text-tertiary)] disabled:no-underline"
      >
        {copy.reset}
      </button>
    </div>
  );
}
