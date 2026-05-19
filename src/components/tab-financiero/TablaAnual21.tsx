import type { FlujoAnual } from "@/lib/tab-financiero/calculos";

interface Props {
  flujos: readonly FlujoAnual[];
  payback: number | null;
}

const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const FMT_MWH = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const FMT_MXN = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function TablaAnual21({ flujos, payback }: Props) {
  const idxPayback = payback !== null ? Math.round(payback) : -1;

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Detalle anual
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Tabla anual · 21 años (año 0 al 20)
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Año por año del flujo financiero con la curva SOH aplicada. La
          fila destacada en verde es el primer año donde el flujo
          acumulado cruza cero (payback).
        </p>
      </header>
      <div className="overflow-x-auto rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <Th align="left">Año</Th>
              <Th>SOH (%)</Th>
              <Th>Desc. en punta (MWh)</Th>
              <Th>Ingreso (MXN)</Th>
              <Th>OPEX (MXN)</Th>
              <Th>Flujo neto (MXN)</Th>
              <Th>Flujo acumulado (MXN)</Th>
            </tr>
          </thead>
          <tbody>
            {flujos.map((f) => {
              const esPayback = idxPayback === f.anio;
              return (
                <tr
                  key={f.anio}
                  className={`border-t-[0.5px] border-[var(--color-border-light)] ${
                    esPayback ? "bg-[#ECFDF5]" : ""
                  }`}
                >
                  <Td align="left" emphasis>
                    {f.anio}
                  </Td>
                  <Td>{FMT_PCT.format(f.factor_soh * 100)}</Td>
                  <Td>
                    {f.anio === 0
                      ? "—"
                      : FMT_MWH.format(f.energia_descargada_punta_mwh)}
                  </Td>
                  <Td>
                    {f.anio === 0
                      ? "—"
                      : FMT_MXN.format(f.ingreso_total_mxn)}
                  </Td>
                  <Td>
                    {f.anio === 0 ? "—" : FMT_MXN.format(f.opex_mxn)}
                  </Td>
                  <Td>
                    {FMT_MXN.format(f.flujo_neto_mxn)}
                  </Td>
                  <Td>
                    {FMT_MXN.format(f.flujo_acumulado_mxn)}
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
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  emphasis?: boolean;
}) {
  return (
    <td
      className={`px-3.5 py-2 tabular-nums ${
        align === "left" ? "text-left" : "text-right"
      } ${emphasis ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
    >
      {children}
    </td>
  );
}
