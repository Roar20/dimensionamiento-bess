import { useCallback, useMemo, useRef, useState } from "react";

import { COPY_M3 } from "@/lib/copy/modulo-3";
import { recomendarEquipoOptimo } from "@/lib/bess/recomendacion";
import type { DatosSFV } from "@/types/sfv";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

import { Seccion1IntroBESS } from "./Seccion1IntroBESS";
import { Seccion2Catalogo } from "./Seccion2Catalogo";
import { Seccion2EnergiaAlmacenable } from "./Seccion2EnergiaAlmacenable/Seccion2";
import { Seccion3TablaComparativa } from "./Seccion3TablaComparativa";
import { Seccion4GraficasComparativas } from "./Seccion4GraficasComparativas";
import { Seccion5FichasDetalladas } from "./Seccion5FichasDetalladas";

interface Props {
  datos: DatosSFV;
}

export function TabBESS({ datos }: Props) {
  const recomendacion = useMemo(
    () => recomendarEquipoOptimo(datos.config.capacidad_poi_kw),
    [datos.config.capacidad_poi_kw]
  );

  const equipoRecomendadoId = recomendacion.equipo_recomendado.id;
  const seccion5Ref = useRef<HTMLDivElement>(null);
  const [abrirEquipoId, setAbrirEquipoId] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<SeleccionCategoria>("ninguna");
  const [resumenes, setResumenes] = useState<ResumenCategoria[]>([]);

  const handleResumenes = useCallback((nuevos: ResumenCategoria[]) => {
    setResumenes(nuevos);
  }, []);

  const verFicha = (id: string) => {
    setAbrirEquipoId(id);
    requestAnimationFrame(() => {
      const elem = document.getElementById(`equipo-${id}`);
      if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-12 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-ink-primary md:text-3xl">
          {COPY_M3.pagina.titulo}
        </h1>
        <p className="max-w-3xl text-sm text-ink-secondary md:text-base">
          {COPY_M3.pagina.subtitulo}
        </p>
      </header>

      <Seccion1IntroBESS />

      <Seccion2EnergiaAlmacenable
        datos={datos}
        seleccion={seleccion}
        onSeleccionar={setSeleccion}
        onResumenesChange={handleResumenes}
      />

      <Seccion2Catalogo
        recomendacion={recomendacion}
        seleccion={seleccion}
        resumenes={resumenes}
        poi_kw={datos.config.capacidad_poi_kw}
        onVerFicha={verFicha}
      />
      <Seccion3TablaComparativa equipoRecomendadoId={equipoRecomendadoId} />
      <Seccion4GraficasComparativas
        equipoRecomendadoId={equipoRecomendadoId}
      />
      <Seccion5FichasDetalladas
        ref={seccion5Ref}
        equipoRecomendadoId={equipoRecomendadoId}
        abrirEquipoId={abrirEquipoId}
      />
    </div>
  );
}
