import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

export type TabNavItem = {
  label: string;
  ruta: string;
  habilitado: boolean;
  tooltip?: string;
};

interface Props {
  items: readonly TabNavItem[];
}

/**
 * Tab nav inline tipo "píldoras" (estilo mockups P0).
 * - Item activo: bg-corp-primary + texto blanco.
 * - Item inactivo habilitado: text-text-tertiary, hover sutil.
 * - Item deshabilitado: igual color tertiary pero con cursor-not-allowed
 *   y tooltip nativo (atributo title).
 *
 * Presentacional puro: recibe la lista, no decide la habilitación.
 */
export function TabNav({ items }: Props) {
  return (
    <nav
      className="mb-6 flex gap-1 border-b border-[var(--color-border-light)] pb-4"
      aria-label="Navegación principal"
    >
      {items.map((item) =>
        item.habilitado ? (
          <NavLink
            key={item.label}
            to={item.ruta}
            className={({ isActive }) =>
              cn(
                "select-none rounded-md px-3.5 py-2 text-[13px] font-normal text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-secondary)]",
                isActive &&
                  "bg-[var(--color-primary)] font-medium text-white hover:bg-[var(--color-primary-dark)]"
              )
            }
          >
            {item.label}
          </NavLink>
        ) : (
          <span
            key={item.label}
            aria-disabled="true"
            title={item.tooltip}
            className="cursor-not-allowed select-none rounded-md px-3.5 py-2 text-[13px] font-normal text-[var(--color-text-tertiary)] opacity-60"
          >
            {item.label}
          </span>
        )
      )}
    </nav>
  );
}
