interface Props {
  ingreso_sfv_solo_anio1: number;
  ingreso_sfv_bess_anio1: number;
  delta_anio1: number;
  payback: number | null;
  ingreso_acumulado_sfv_bess: number;
  ingreso_acumulado_sfv_solo: number;
}

const FMT_NUM = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function fmtMillones(v: number): string {
  return `${FMT_NUM.format(v / 1_000_000)} M`;
}

export function SeccionComparativa({
  ingreso_sfv_solo_anio1,
  ingreso_sfv_bess_anio1,
  delta_anio1,
  payback,
  ingreso_acumulado_sfv_bess,
  ingreso_acumulado_sfv_solo,
}: Props) {
  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Comparativa de escenarios
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          SFV solo vs SFV + BESS
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Línea base (energía PPA + CELs) y configuración con BESS lado a
          lado. Los precios son los mismos en ambos escenarios; lo que cambia
          son las capacidades que el BESS habilita.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ColumnaEscenario
          titulo="SFV solo (línea base)"
          subtitulo="Sin almacenamiento, sin arbitraje, sin potencia firme"
          variante="base"
          metricas={[
            { label: "Ingreso bruto año 1", valor: fmtMillones(ingreso_sfv_solo_anio1) },
            { label: "Ingreso acumulado 20 años", valor: fmtMillones(ingreso_acumulado_sfv_solo) },
            { label: "Payback", valor: "—" },
          ]}
          capacidades={[
            { activa: true, texto: "Energía PPA (toda la generación al precio contratado)" },
            { activa: true, texto: "CELs emitidos sobre la generación" },
            { activa: false, texto: "Captura de excedentes generados" },
            { activa: false, texto: "Arbitraje hora-punta CFE" },
            { activa: false, texto: "Potencia firme estimada (proxy preliminar)" },
          ]}
        />
        <ColumnaEscenario
          titulo="SFV + BESS"
          subtitulo="Almacenamiento que recompone la calidad económica de la energía"
          variante="destacada"
          metricas={[
            { label: "Ingreso bruto año 1", valor: fmtMillones(ingreso_sfv_bess_anio1) },
            { label: "Ingreso acumulado 20 años", valor: fmtMillones(ingreso_acumulado_sfv_bess) },
            { label: "Δ año 1 vs SFV solo", valor: fmtMillones(delta_anio1) },
            {
              label: "Payback",
              valor:
                payback !== null ? `${FMT_NUM.format(payback)} años` : ">20 años",
            },
          ]}
          capacidades={[
            { activa: true, texto: "Energía PPA (toda la generación al precio contratado)" },
            { activa: true, texto: "CELs emitidos sobre la generación" },
            { activa: true, texto: "Captura de excedentes que sin BESS se perderían" },
            { activa: true, texto: "Arbitraje hora-punta CFE 18-22h" },
            { activa: true, texto: "Potencia firme estimada (proxy preliminar)" },
          ]}
        />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
        Los valores acumulados aplican la curva SOH del catálogo año por año
        sobre los componentes que dependen del BESS (captura, arbitraje,
        potencia firme). Los CELs no degradan: dependen de la generación del
        SFV, no de la capacidad del BESS. El precio total bruto NO descuenta
        OPEX ni CAPEX; esos pasos viven en el flujo neto del flujo
        acumulado.
      </p>
    </section>
  );
}

type Metrica = { label: string; valor: string };
type Capacidad = { activa: boolean; texto: string };

function ColumnaEscenario({
  titulo,
  subtitulo,
  variante,
  metricas,
  capacidades,
}: {
  titulo: string;
  subtitulo: string;
  variante: "base" | "destacada";
  metricas: readonly Metrica[];
  capacidades: readonly Capacidad[];
}) {
  const fondoHeader =
    variante === "destacada"
      ? "bg-[#0F766E] text-white"
      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]";
  return (
    <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
      <div className={`px-4 py-3 ${fondoHeader}`}>
        <p className="text-[14px] font-medium leading-tight">{titulo}</p>
        <p className="text-[11px] opacity-90">{subtitulo}</p>
      </div>
      <div className="border-b-[0.5px] border-[var(--color-border-light)] px-4 py-3">
        {metricas.map((m) => (
          <div
            key={m.label}
            className="flex items-baseline justify-between border-t-[0.5px] border-[var(--color-border-light)] py-1.5 first:border-t-0"
          >
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              {m.label}
            </span>
            <span className="text-[14px] font-medium tabular-nums text-[var(--color-text-primary)]">
              {m.valor}
            </span>
          </div>
        ))}
      </div>
      <ul className="px-4 py-3 text-[12px]">
        {capacidades.map((c) => (
          <li key={c.texto} className="flex items-start gap-2 py-1">
            <span
              className={`mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                c.activa
                  ? "bg-[#10B981] text-white"
                  : "bg-[var(--color-border-light)] text-[var(--color-text-tertiary)]"
              }`}
              aria-hidden
            >
              {c.activa ? "✓" : "·"}
            </span>
            <span
              className={
                c.activa
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] line-through"
              }
            >
              {c.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
