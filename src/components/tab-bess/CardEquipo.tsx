import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import {
  duracionNominalHoras,
  type EquipoBESS,
} from "@/lib/bess/catalogo-hyperstrong";
import { cn } from "@/lib/utils";

interface Props {
  equipo: EquipoBESS;
  esRecomendado?: boolean;
  onVerFicha: (id: string) => void;
}

export function CardEquipo({ equipo, esRecomendado, onVerFicha }: Props) {
  const copy = COPY_M3.seccion2;
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        esRecomendado && "border-2 border-action shadow-md"
      )}
    >
      {esRecomendado ? (
        <span className="absolute -top-3 left-4 rounded-full bg-action px-3 py-0.5 text-xs font-medium text-white shadow-sm">
          {copy.badgeRecomendado}
        </span>
      ) : null}
      <CardHeader className="space-y-1 pb-3">
        <h3 className="text-lg font-semibold text-ink-primary">
          {equipo.nombre_corto}
        </h3>
        <p className="text-xs text-ink-helper">{equipo.nombre_completo}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pb-3">
        <div>
          <span className="text-3xl font-bold tabular-nums text-ink-primary">
            {equipo.kw_ac.toLocaleString("es-MX")}
          </span>
          <span className="ml-1 text-sm text-ink-helper">
            {copy.kpiPotencia}
          </span>
        </div>
        <div>
          <span className="text-3xl font-bold tabular-nums text-ink-primary">
            {Math.round(equipo.kwh).toLocaleString("es-MX")}
          </span>
          <span className="ml-1 text-sm text-ink-helper">
            {copy.kpiEnergia}
          </span>
        </div>
        <div className="text-xs text-ink-helper">
          {copy.duracionLabel(duracionNominalHoras(equipo))}
        </div>
        <div className="border-t border-brand-cardBorder pt-2 text-xs text-ink-helper">
          {copy.metaLabel(
            equipo.familia,
            equipo.tipo_bateria,
            equipo.eficiencia_max
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onVerFicha(equipo.id)}
        >
          {copy.verFicha}
        </Button>
      </CardFooter>
    </Card>
  );
}
