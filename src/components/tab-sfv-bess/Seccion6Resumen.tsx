import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M5 } from "@/lib/copy/modulo-5";

interface Props {
  bullets: readonly string[];
}

export function Seccion6Resumen({ bullets }: Props) {
  const copy = COPY_M5.seccion6;
  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto="" />

      <Card>
        <CardContent className="space-y-3 p-6">
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" />
                <span className="text-ink-secondary">{b}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-3 rounded-card border-l-4 border-status-info bg-info-bg p-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink-secondary">{copy.cta}</p>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button type="button" variant="outline" disabled>
                  {copy.botonFinanciero}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{copy.botonTooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </section>
  );
}
