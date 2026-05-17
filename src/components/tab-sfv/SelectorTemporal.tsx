import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import type { Granularidad, PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";

interface Props {
  granularidad: Granularidad;
  setGranularidad: (g: Granularidad) => void;
  periodo: PeriodoActivo | null;
  periodos: PeriodoActivo[];
  irAnterior: () => void;
  irSiguiente: () => void;
  hayAnterior: boolean;
  haySiguiente: boolean;
  seleccionarPorId: (id: string) => void;
}

export function SelectorTemporal({
  granularidad,
  setGranularidad,
  periodo,
  periodos,
  irAnterior,
  irSiguiente,
  hayAnterior,
  haySiguiente,
  seleccionarPorId,
}: Props) {
  const copy = COPY_M2.selectorTemporal;
  return (
    <div className="sticky top-0 z-20 border-b border-brand-cardBorder bg-brand-page/95 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-helper">{copy.label}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={irAnterior}
              disabled={!hayAnterior}
              aria-label={copy.anterior}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select
              value={periodo?.id ?? ""}
              onValueChange={(v) => seleccionarPorId(v)}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder={periodo?.label ?? ""} />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={irSiguiente}
              disabled={!haySiguiente}
              aria-label={copy.siguiente}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <RadioGroup
            value={granularidad}
            onValueChange={(v) => setGranularidad(v as Granularidad)}
            className="flex flex-row items-center gap-4"
          >
            {(["anual", "mensual", "diario"] as const).map((g) => (
              <label
                key={g}
                htmlFor={`gran-${g}`}
                className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-secondary"
              >
                <RadioGroupItem value={g} id={`gran-${g}`} />
                {copy.granularidad[g]}
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
