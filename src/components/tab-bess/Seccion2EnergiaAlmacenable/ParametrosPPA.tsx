import { useEffect, useState } from "react";
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
              <InputNumeroBuffer
                id="ppa-compromiso"
                valor={params.compromiso_mensual_mwh}
                onValido={(n) =>
                  onActualizar({ compromiso_mensual_mwh: n })
                }
                min={0}
                step="0.1"
                ancho="w-32"
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
              <InputNumeroBuffer
                id="ppa-punta-ini"
                valor={ini}
                onValido={(n) => {
                  if (n < fin) {
                    onActualizar({
                      ventana_punta_cfe: [n, fin] as const,
                    });
                  }
                }}
                min={HORA_MIN_VALIDA}
                max={HORA_MAX_VALIDA}
                step="1"
                ancho="w-20"
              />
              <span className="text-sm text-ink-helper">:00</span>
              <span className="mx-1 text-ink-helper">–</span>
              <InputNumeroBuffer
                ariaLabel="Hora-punta fin"
                valor={fin}
                onValido={(n) => {
                  if (n > ini) {
                    onActualizar({
                      ventana_punta_cfe: [ini, n] as const,
                    });
                  }
                }}
                min={HORA_MIN_VALIDA}
                max={HORA_MAX_VALIDA}
                step="1"
                ancho="w-20"
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

interface InputNumeroBufferProps {
  valor: number;
  onValido: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  ancho?: string;
  id?: string;
  ariaLabel?: string;
}

/**
 * Input numérico con buffer de texto local: el usuario puede borrar el
 * contenido, escribir caracter por caracter y solo se notifica al padre
 * cuando el valor parsea a un número válido en [min, max]. En blur se
 * revierte al valor del padre si el buffer no parsea o queda fuera de
 * rango. Evita que el estado del padre se "atasque" entre teclazos.
 */
function InputNumeroBuffer({
  valor,
  onValido,
  min,
  max,
  step = "any",
  ancho = "w-32",
  id,
  ariaLabel,
}: InputNumeroBufferProps) {
  const [buffer, setBuffer] = useState(String(valor));

  useEffect(() => {
    setBuffer(String(valor));
  }, [valor]);

  const procesar = (raw: string) => {
    setBuffer(raw);
    if (raw === "" || raw === "-" || raw === ".") return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (min !== undefined && n < min) return;
    if (max !== undefined && n > max) return;
    onValido(n);
  };

  const blur = () => {
    const n = Number(buffer);
    if (
      !Number.isFinite(n) ||
      (min !== undefined && n < min) ||
      (max !== undefined && n > max)
    ) {
      setBuffer(String(valor));
    }
  };

  return (
    <Input
      id={id}
      aria-label={ariaLabel}
      type="number"
      step={step}
      min={min}
      max={max}
      value={buffer}
      onChange={(e) => procesar(e.target.value)}
      onBlur={blur}
      className={`${ancho} tabular-nums`}
    />
  );
}
