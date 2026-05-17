import { type ReactNode } from "react";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewMode } from "@/context/ViewModeContext";

interface Props {
  titulo: string;
  tooltip?: string;
  children: ReactNode;
}

export function BloqueTecnico({ titulo, tooltip, children }: Props) {
  const { mode } = useViewMode();
  if (mode !== "tecnico") return null;

  return (
    <details className="mt-6 rounded-card border border-brand-cardBorder bg-slate-50">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-ink-secondary">
        <span>{titulo}</span>
        {tooltip ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center text-ink-helper transition-colors hover:text-ink-secondary"
                  aria-label={`Más información: ${titulo}`}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </summary>
      <div className="border-t border-brand-cardBorder px-4 py-3 text-sm text-ink-secondary">
        {children}
      </div>
    </details>
  );
}
