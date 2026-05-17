import { Info, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CATALOGO_HYPERSTRONG,
  duracionNominalHoras,
  type EquipoBESS,
} from "@/lib/bess/catalogo-hyperstrong";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import { cn } from "@/lib/utils";

import { KPICardSFVBess } from "./KPICardSFVBess";

interface Props {
  equipoSeleccionado: EquipoBESS;
  multiplicador: number;
  equipoRecomendado: EquipoBESS | null;
  min: number;
  max: number;
  setEquipo: (id: string) => void;
  setMultiplicador: (n: number) => void;
}

const FMT_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const FMT_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function SelectorEquipoMultiplicador({
  equipoSeleccionado,
  multiplicador,
  equipoRecomendado,
  min,
  max,
  setEquipo,
  setMultiplicador,
}: Props) {
  const copy = COPY_M5.seccion1;
  const inversion = equipoSeleccionado.precio_usd * multiplicador;
  const pTotal = equipoSeleccionado.kw_ac * multiplicador;
  const eTotal = equipoSeleccionado.kwh * multiplicador;

  return (
    <div className="space-y-5 rounded-card border border-brand-cardBorder bg-white p-6 shadow-card">
      <div className="grid gap-3 md:grid-cols-3">
        {CATALOGO_HYPERSTRONG.map((eq) => {
          const activo = eq.id === equipoSeleccionado.id;
          const recomendado = equipoRecomendado?.id === eq.id;
          return (
            <button
              key={eq.id}
              type="button"
              onClick={() => setEquipo(eq.id)}
              aria-pressed={activo}
              className={cn(
                "rounded-card border-2 p-4 text-left transition-colors",
                activo
                  ? "border-action bg-action/5"
                  : "border-brand-cardBorder hover:border-action/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-primary">
                  {eq.nombre_corto}
                </span>
                {recomendado ? (
                  <span className="rounded-full border border-action/40 px-2 py-0.5 text-[10px] font-medium text-action">
                    {copy.badgeRecomendado}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-ink-secondary tabular-nums">
                {FMT_ENTERO.format(eq.kw_ac)} kW ×{" "}
                {FMT_ENTERO.format(eq.kwh)} kWh
              </div>
              <div className="mt-1 text-xs text-ink-helper">
                {FMT_USD.format(eq.precio_usd)}/unidad
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-brand-cardBorder pt-4">
        <label className="text-sm font-medium text-ink-primary">
          {copy.multiplicador.label}:
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMultiplicador(multiplicador - 1)}
            disabled={multiplicador <= min}
            aria-label="Disminuir unidades"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-semibold tabular-nums text-ink-primary">
            {multiplicador}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMultiplicador(multiplicador + 1)}
            disabled={multiplicador >= max}
            aria-label="Aumentar unidades"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Más información sobre el multiplicador"
                className="text-ink-helper hover:text-ink-secondary"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              {copy.multiplicador.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-3 rounded-card bg-slate-50 p-4 sm:grid-cols-2 md:grid-cols-4">
        <KPICardSFVBess
          etiqueta={copy.kpis.potenciaTotal}
          valor={`${FMT_ENTERO.format(pTotal)} kW AC`}
          acento="primario"
        />
        <KPICardSFVBess
          etiqueta={copy.kpis.capacidadTotal}
          valor={`${FMT_ENTERO.format(eTotal)} kWh`}
          acento="primario"
        />
        <KPICardSFVBess
          etiqueta={copy.kpis.duracionNominal}
          valor={`${duracionNominalHoras(equipoSeleccionado).toFixed(1)} h`}
        />
        <KPICardSFVBess
          etiqueta={copy.kpis.inversion}
          valor={FMT_USD.format(inversion)}
        />
      </div>
    </div>
  );
}
