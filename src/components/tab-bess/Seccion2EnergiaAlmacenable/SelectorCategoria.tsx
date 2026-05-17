import { Card, CardContent } from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

interface Props {
  seleccion: SeleccionCategoria;
  onSeleccionar: (s: SeleccionCategoria) => void;
  resumenes: readonly ResumenCategoria[];
}

export function SelectorCategoria({
  seleccion,
  onSeleccionar,
  resumenes,
}: Props) {
  const copy = COPY_M3.seccion2Energia.selector;
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold text-ink-primary">
            {copy.titulo}
          </h3>
          <p className="text-sm text-ink-helper">{copy.subtitulo}</p>
        </header>

        <RadioGroup
          value={seleccion}
          onValueChange={(v) => onSeleccionar(v as SeleccionCategoria)}
          className="space-y-2"
        >
          <Opcion
            value="ninguna"
            titulo={copy.ninguna.label}
            descripcion={copy.ninguna.descripcion}
          />
          {resumenes.map((r) => (
            <Opcion
              key={r.categoria.tipo}
              value={r.categoria.tipo}
              titulo={r.categoria.etiqueta}
              descripcion={copy.resumenItem(r.total_mwh, r.porcentaje)}
            />
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function Opcion({
  value,
  titulo,
  descripcion,
}: {
  value: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <label
      htmlFor={`cat-${value}`}
      className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50"
    >
      <RadioGroupItem value={value} id={`cat-${value}`} className="mt-0.5" />
      <div className="flex-1 text-sm">
        <div className="font-medium text-ink-primary">{titulo}</div>
        <div className="text-ink-helper">{descripcion}</div>
      </div>
    </label>
  );
}
