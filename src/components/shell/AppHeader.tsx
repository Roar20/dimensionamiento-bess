import { NavLink } from "react-router-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewToggle } from "@/components/shell/ViewToggle";
import { cn } from "@/lib/utils";

const TABS_HABILITABLES = [
  { label: "SFV", ruta: "/sfv" },
  { label: "BESS", ruta: "/bess" },
  { label: "SFV + BESS", ruta: "/sfv-bess" },
] as const;

const TABS_DESHABILITADOS = ["Análisis financiero"];

interface Props {
  hayDatos: boolean;
}

export function AppHeader({ hayDatos }: Props) {
  return (
    <header className="bg-brand-header text-brand-headerFg">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4">
        <div className="font-semibold">Dimensionamiento BESS</div>

        <TooltipProvider delayDuration={150}>
          <nav className="hidden items-center gap-1 md:flex">
            {TABS_HABILITABLES.map(({ label, ruta }) =>
              hayDatos ? (
                <NavLink
                  key={label}
                  to={ruta}
                  className={({ isActive }) =>
                    cn(
                      "select-none rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                      isActive && "bg-white/15"
                    )
                  }
                >
                  {label}
                </NavLink>
              ) : (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed select-none rounded-md px-3 py-2 text-sm font-medium opacity-60"
                    >
                      {label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Carga un archivo para habilitar el análisis
                  </TooltipContent>
                </Tooltip>
              )
            )}
            {TABS_DESHABILITADOS.map((label) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <span
                    aria-disabled="true"
                    className="cursor-not-allowed select-none rounded-md px-3 py-2 text-sm font-medium opacity-60"
                  >
                    {label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Disponible en próxima versión</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>

        <ViewToggle />
      </div>
    </header>
  );
}
