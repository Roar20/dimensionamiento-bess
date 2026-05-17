import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewToggle } from "@/components/shell/ViewToggle";

const NAV_ITEMS = ["SFV", "BESS", "SFV + BESS", "Análisis financiero"];

export function AppHeader() {
  return (
    <header className="bg-brand-header text-brand-headerFg">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="font-semibold">Dimensionamiento BESS</div>

        <TooltipProvider delayDuration={150}>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((label) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <span
                    aria-disabled="true"
                    className="cursor-not-allowed select-none rounded-md px-3 py-2 text-sm font-medium"
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
