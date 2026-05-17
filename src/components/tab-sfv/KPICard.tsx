import { Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  valor: string;
  sublabel?: string;
  unidad?: string;
  tooltip?: string;
  destacado?: boolean;
}

export function KPICard({
  label,
  valor,
  sublabel,
  unidad,
  tooltip,
  destacado,
}: Props) {
  return (
    <Card className={cn(destacado && "border-action/40 shadow-sm")}>
      <CardContent className="space-y-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-ink-helper">
            {label}
          </p>
          {tooltip ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Más información: ${label}`}
                    className="text-ink-helper transition-colors hover:text-ink-secondary"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] text-left">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
        <p className="text-2xl font-semibold text-ink-primary tabular-nums">
          {valor}
          {unidad ? (
            <span className="ml-1 text-sm font-medium text-ink-helper">
              {unidad}
            </span>
          ) : null}
        </p>
        {sublabel ? (
          <p className="text-xs text-ink-helper">{sublabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
