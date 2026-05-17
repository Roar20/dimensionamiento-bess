import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

interface Props {
  seleccion: SeleccionCategoria;
  resumenes: readonly ResumenCategoria[];
  onSeleccionar: (s: SeleccionCategoria) => void;
}

export function SelectorCategoriaCompacto({
  seleccion,
  resumenes,
  onSeleccionar,
}: Props) {
  const copy = COPY_M5.selectorCategoria;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor="categoria-sfv-bess"
        className="text-sm text-ink-helper"
      >
        {copy.label}
      </label>
      <Select
        value={seleccion}
        onValueChange={(v) => onSeleccionar(v as SeleccionCategoria)}
      >
        <SelectTrigger id="categoria-sfv-bess" className="min-w-[320px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ninguna">{copy.ninguna}</SelectItem>
          {resumenes.map((r) => (
            <SelectItem key={r.categoria.tipo} value={r.categoria.tipo}>
              {r.categoria.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
