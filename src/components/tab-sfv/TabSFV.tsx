import { Button } from "@/components/ui/button";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { usePeriodoActivo } from "@/hooks/usePeriodoActivo";
import type { DatosSFV } from "@/types/sfv";

import { Seccion1Generacion } from "./Seccion1Generacion";
import { Seccion2PerfilDiario } from "./Seccion2PerfilDiario";
import { Seccion3Variabilidad } from "./Seccion3Variabilidad";
import { Seccion4Heatmap } from "./Seccion4Heatmap";
import { Seccion5ResumenMensual } from "./Seccion5ResumenMensual";
import { SelectorTemporal } from "./SelectorTemporal";

interface Props {
  datos: DatosSFV;
}

export function TabSFV({ datos }: Props) {
  const {
    periodo,
    granularidad,
    setGranularidad,
    irAnterior,
    irSiguiente,
    hayAnterior,
    haySiguiente,
    seleccionarPorId,
    registrosFiltrados,
    periodosDisponibles,
  } = usePeriodoActivo(datos);

  if (!periodo) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-ink-helper">
          No hay periodos disponibles para los datos cargados.
        </p>
      </div>
    );
  }

  const sinDatos = registrosFiltrados.length === 0;

  return (
    <div>
      <SelectorTemporal
        granularidad={granularidad}
        setGranularidad={setGranularidad}
        periodo={periodo}
        periodos={periodosDisponibles}
        irAnterior={irAnterior}
        irSiguiente={irSiguiente}
        hayAnterior={hayAnterior}
        haySiguiente={haySiguiente}
        seleccionarPorId={seleccionarPorId}
      />

      <div className="container mx-auto max-w-7xl space-y-12 px-4 py-8">
        {sinDatos ? (
          <SinDatos label={periodo.label} onAnterior={irAnterior} hayAnterior={hayAnterior} />
        ) : (
          <>
            <Seccion1Generacion
              registros={registrosFiltrados}
              config={datos.config}
              periodo={periodo}
            />
            <Seccion2PerfilDiario
              registros={registrosFiltrados}
              config={datos.config}
              periodo={periodo}
            />
            {granularidad !== "diario" ? (
              <Seccion3Variabilidad
                registros={registrosFiltrados}
                periodo={periodo}
              />
            ) : null}
            <Seccion4Heatmap
              registros={registrosFiltrados}
              periodo={periodo}
            />
            {granularidad === "anual" ? (
              <Seccion5ResumenMensual
                registros={registrosFiltrados}
                config={datos.config}
                anio={periodo.fechaInicio.getFullYear()}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function SinDatos({
  label,
  onAnterior,
  hayAnterior,
}: {
  label: string;
  onAnterior: () => void;
  hayAnterior: boolean;
}) {
  const copy = COPY_M2.periodoSinDatos;
  return (
    <div className="rounded-card border border-brand-cardBorder bg-white p-8 text-center shadow-card">
      <p className="text-lg font-semibold text-ink-primary">
        {copy.titulo(label)}
      </p>
      <p className="mt-2 text-sm text-ink-helper">{copy.ayuda}</p>
      {hayAnterior ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onAnterior}>
          {copy.botonAnterior}
        </Button>
      ) : null}
    </div>
  );
}
