import type { ResumenMes } from "@/lib/tab-sfv/agregaciones-mensuales";

interface Props {
  resumen: readonly ResumenMes[];
  mejoresDiaKwhPorMes: ReadonlyMap<string, number>;
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const MES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatearMejorDia(
  fechaIso: string | null,
  mwh: number,
  kwhDelDia: number | undefined
): string {
  if (!fechaIso || mwh <= 0) return "—";
  const [, mStr, dStr] = fechaIso.split("-");
  const dia = Number(dStr);
  const mes = MES_CORTO[Number(mStr) - 1]!.toLowerCase();
  const kwh = kwhDelDia ?? mwh * 1000;
  return `${String(dia).padStart(2, "0")} ${mes} · ${FORMATO_ENTERO.format(kwh)} kWh`;
}

export function TablaResumenMensual({ resumen, mejoresDiaKwhPorMes }: Props) {
  return (
    <section className="mb-8">
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Resumen mensual
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Comportamiento mes a mes del recurso durante el año base
        </p>
      </header>
      <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <Th align="left">Mes</Th>
              <Th>Generación</Th>
              <Th>Excedente</Th>
              <Th>Pico</Th>
              <Th>Días activos</Th>
              <Th>Mejor día</Th>
            </tr>
          </thead>
          <tbody>
            {resumen.map((m) => {
              const diasMesCalendario = new Date(
                m.anio,
                m.mes + 1,
                0
              ).getDate();
              const kwhMejorDia = mejoresDiaKwhPorMes.get(
                `${m.anio}-${String(m.mes + 1).padStart(2, "0")}`
              );
              return (
                <tr
                  key={`${m.anio}-${m.mes}`}
                  className="border-t-[0.5px] border-[var(--color-border-light)]"
                >
                  <Td align="left" emphasis>
                    {MES_CORTO[m.mes]}
                  </Td>
                  <Td>
                    {FORMATO_1DEC.format(m.energia_mwh)}{" "}
                    <Unit>MWh</Unit>
                  </Td>
                  <Td>
                    {m.excedente_mwh < 0.05 ? (
                      <span className="text-[var(--color-text-tertiary)]">
                        —
                      </span>
                    ) : (
                      <>
                        {FORMATO_1DEC.format(m.excedente_mwh)}{" "}
                        <Unit>MWh</Unit>
                      </>
                    )}
                  </Td>
                  <Td>
                    {FORMATO_ENTERO.format(m.pico_kw)} <Unit>kW</Unit>
                  </Td>
                  <Td muted>
                    {m.dias_con_generacion} de {diasMesCalendario}
                  </Td>
                  <Td muted>
                    {formatearMejorDia(
                      m.mejor_dia_fecha,
                      m.mejor_dia_mwh,
                      kwhMejorDia
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-3.5 py-3 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)] ${
        align === "left" ? "text-left" : "text-right"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "right",
  emphasis = false,
  muted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={`px-3.5 py-2.5 tabular-nums ${
        align === "left" ? "text-left" : "text-right"
      } ${emphasis ? "font-medium" : ""} ${
        muted ? "text-[var(--color-text-secondary)]" : ""
      }`}
    >
      {children}
    </td>
  );
}

function Unit({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] text-[var(--color-text-tertiary)]">
      {children}
    </span>
  );
}
