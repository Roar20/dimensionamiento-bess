interface Props {
  nombrePlanta: string | null;
  anio: number;
  totalRegistros: number;
  poiKw: number;
  zonaLmp: string | null;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function HeaderDossier({
  nombrePlanta,
  anio,
  totalRegistros,
  poiKw,
  zonaLmp,
}: Props) {
  const titulo = nombrePlanta
    ? `Análisis de la curva de generación del SFV — ${nombrePlanta}`
    : "Análisis de la curva de generación del SFV";

  return (
    <header className="mb-8">
      <h1
        className={
          "mb-1.5 text-2xl font-medium tracking-[-0.01em] text-[var(--color-text-primary)]" +
          (nombrePlanta ? "" : " ")
        }
      >
        {titulo}
        {!nombrePlanta ? (
          <span className="ml-2 text-base text-[var(--color-text-tertiary)]">
            · Sin planta configurada
          </span>
        ) : null}
      </h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
        <Chip icono="ti-calendar" texto={`Año base ${anio}`} />
        <Chip
          icono="ti-database"
          texto={`${FORMATO_ENTERO.format(totalRegistros)} registros horarios`}
        />
        <Chip icono="ti-bolt" texto={`POI ${FORMATO_ENTERO.format(poiKw)} kW`} />
        {zonaLmp ? (
          <Chip icono="ti-map-pin" texto={`Zona LMP ${zonaLmp}`} />
        ) : null}
      </div>
    </header>
  );
}

function Chip({ icono, texto }: { icono: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className={`ti ${icono} text-[var(--color-text-tertiary)]`}
        aria-hidden="true"
      />
      {texto}
    </span>
  );
}
