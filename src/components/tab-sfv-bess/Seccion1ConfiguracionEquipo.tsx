import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import type { EquipoBESS } from "@/lib/bess/catalogo-hyperstrong";

import { SelectorEquipoMultiplicador } from "./SelectorEquipoMultiplicador";

interface Props {
  equipoSeleccionado: EquipoBESS;
  multiplicador: number;
  equipoRecomendado: EquipoBESS | null;
  min: number;
  max: number;
  setEquipo: (id: string) => void;
  setMultiplicador: (n: number) => void;
}

export function Seccion1ConfiguracionEquipo(props: Props) {
  const copy = COPY_M5.seccion1;
  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />
      <SelectorEquipoMultiplicador {...props} />
    </section>
  );
}
