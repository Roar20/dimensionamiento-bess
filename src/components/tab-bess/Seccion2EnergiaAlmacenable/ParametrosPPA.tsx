import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import { HORA_MAX_VALIDA, HORA_MIN_VALIDA } from "@/lib/core/bess";
import type { ParametrosPPA } from "@/types/bess";

interface Props {
  params: ParametrosPPA;
  promedioMensualSFV: number;
  onActualizar: (parcial: Partial<ParametrosPPA>) => void;
  onResetear: () => void;
}

const copy = COPY_M3.seccion2Energia.parametros;

export function ParametrosPPA({
  params,
  promedioMensualSFV,
  onActualizar,
  onResetear,
}: Props) {
  const [ini, fin] = params.ventana_punta_cfe;
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold text-ink-primary">
            {copy.titulo}
          </h3>
          <p className="text-sm text-ink-helper">{copy.subtitulo}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Compromiso */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="ppa-compromiso">{copy.compromiso.label}</Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-ink-helper hover:text-ink-secondary"
                      aria-label="Más información"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    {copy.compromiso.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="ppa-compromiso"
                type="number"
                step="0.1"
                min="0"
                value={params.compromiso_mensual_mwh}
                onChange={(e) =>
                  onActualizar({
                    compromiso_mensual_mwh:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                className="w-32 tabular-nums"
              />
              <span className="text-sm text-ink-helper">
                {copy.compromiso.unidad}
              </span>
            </div>
            <p className="text-xs text-ink-helper">
              {copy.compromiso.ayuda(promedioMensualSFV)}
            </p>
          </div>

          {/* Ventana punta */}
          <div className="space-y-1.5">
            <Label htmlFor="ppa-punta-ini">{copy.ventana.label}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ppa-punta-ini"
                type="number"
                min={HORA_MIN_VALIDA}
                max={HORA_MAX_VALIDA}
                value={ini}
                onChange={(e) =>
                  onActualizar({
                    ventana_punta_cfe: [
                      Number(e.target.value) || HORA_MIN_VALIDA,
                      fin,
                    ] as const,
                  })
                }
                className="w-20 tabular-nums"
              />
              <span className="text-sm text-ink-helper">:00</span>
              <span className="mx-1 text-ink-helper">–</span>
              <Input
                aria-label="Hora-punta fin"
                type="number"
                min={HORA_MIN_VALIDA}
                max={HORA_MAX_VALIDA}
                value={fin}
                onChange={(e) =>
                  onActualizar({
                    ventana_punta_cfe: [
                      ini,
                      Number(e.target.value) || HORA_MAX_VALIDA,
                    ] as const,
                  })
                }
                className="w-20 tabular-nums"
              />
              <span className="text-sm text-ink-helper">:00</span>
            </div>
            <p className="text-xs text-ink-helper">{copy.ventana.ayuda}</p>
          </div>

          {/* POI (read-only) */}
          <div className="space-y-1.5">
            <Label htmlFor="ppa-poi">{copy.poi.label}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ppa-poi"
                type="number"
                value={params.capacidad_poi_kw}
                disabled
                className="w-32 bg-slate-50 tabular-nums"
              />
              <span className="text-sm text-ink-helper">{copy.poi.unidad}</span>
            </div>
            <p className="text-xs text-ink-helper">{copy.poi.ayuda}</p>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetear}
            className="text-xs"
          >
            {copy.resetear}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
