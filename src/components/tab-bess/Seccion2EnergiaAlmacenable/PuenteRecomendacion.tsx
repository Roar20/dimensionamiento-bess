import { Card, CardContent } from "@/components/ui/card";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";
import { cn } from "@/lib/utils";

interface Props {
  seleccion: SeleccionCategoria;
  resumenes: readonly ResumenCategoria[];
}

export function PuenteRecomendacion({ seleccion, resumenes }: Props) {
  const copy = COPY_M3.seccion2Energia.puente;

  if (seleccion === "ninguna") {
    const totales = resumenes.map((r) => r.total_mwh);
    const min = totales.length > 0 ? Math.min(...totales) : 0;
    const max = totales.length > 0 ? Math.max(...totales) : 0;

    return (
      <Bloque acentoColor="bg-status-info">
        <Encabezado titulo={copy.titulo} />
        <dl className="space-y-1 text-sm">
          <Fila label={copy.labelCategoria} valor={copy.seleccionNinguna} />
          <Fila label={copy.labelRango} valor={copy.rangoFormato(min, max)} />
        </dl>
        <p className="mt-3 text-xs text-ink-secondary">{copy.ayudaNinguna}</p>
      </Bloque>
    );
  }

  const sel = resumenes.find((r) => r.categoria.tipo === seleccion);
  if (!sel) return null;

  return (
    <Bloque acentoColor="bg-action">
      <Encabezado titulo={copy.titulo} />
      <dl className="space-y-1 text-sm">
        <Fila label={copy.labelCategoria} valor={sel.categoria.etiqueta} />
        <Fila
          label={copy.labelTotal}
          valor={copy.totalFormato(sel.total_mwh, sel.promedio_mensual_mwh)}
        />
      </dl>
      <p className="mt-3 text-xs text-ink-secondary">{copy.ayudaSeleccionada}</p>
    </Bloque>
  );
}

function Bloque({
  children,
  acentoColor,
}: {
  children: React.ReactNode;
  acentoColor: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className={cn("w-1 shrink-0", acentoColor)} />
        <CardContent className="flex-1 p-6">{children}</CardContent>
      </div>
    </Card>
  );
}

function Encabezado({ titulo }: { titulo: string }) {
  return (
    <p className="mb-3 text-xs uppercase tracking-wide text-ink-helper">
      {titulo}
    </p>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="font-medium text-ink-primary">{label}</dt>
      <dd className="text-ink-secondary">{valor}</dd>
    </div>
  );
}
