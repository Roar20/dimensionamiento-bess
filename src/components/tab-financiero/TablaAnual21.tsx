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
      <div className="overflow-x-auto rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white max-h-[520px]">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--color-bg-secondary)] shadow-[inset_0_-1px_0_0_var(--color-border-light)]">
              <Th align="left">Año</Th>
              <Th>SOH (%)</Th>
              <Th>Desc. en punta (MWh)</Th>
              <Th variante="informativo">PPA SFV (MXN)</Th>
              <Th variante="informativo">CELs SFV (MXN)</Th>
              <Th>Aporte BESS (MXN)</Th>
              <Th>OPEX (MXN)</Th>
              <Th>Flujo neto BESS (MXN)</Th>
              <Th>Flujo acumulado BESS (MXN)</Th>
            </tr>
          </thead>
          <tbody>
            {flujos.map((f, idx) => {
              const esPayback = idxPayback === f.anio;
              const zebra = idx % 2 === 1 ? "bg-[#FAFAF9]" : "";
              const bgClase = esPayback
                ? "bg-[#D1FAE5] border-l-[3px] border-l-[#10B981]"
                : zebra;
              return (
                <tr
                  key={f.anio}
                  className={`border-t-[0.5px] border-[var(--color-border-light)] transition-colors hover:bg-[#F0FDF4] ${bgClase}`}
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
                  <Td variante="informativo">
                    {f.anio === 0
                      ? "—"
                      : FMT_MXN.format(f.ingreso_ppa_generacion_mxn)}
                  </Td>
                  <Td variante="informativo">
                    {f.anio === 0 ? "—" : FMT_MXN.format(f.ingreso_cels_mxn)}
                  </Td>
                  <Td emphasis={esPayback}>
                    {f.anio === 0
                      ? "—"
                      : FMT_MXN.format(f.ingreso_incremental_bess_mxn)}
                  </Td>
                  <Td>
                    {f.anio === 0 ? "—" : FMT_MXN.format(f.opex_mxn)}
                  </Td>
                  <Td emphasis={esPayback}>
                    {FMT_MXN.format(f.flujo_neto_mxn)}
                  </Td>
                  <Td emphasis={esPayback}>
                    {FMT_MXN.format(f.flujo_acumulado_mxn)}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
        Las columnas PPA SFV y CELs SFV son informativas (gris claro): ya las
        recibía la planta sin BESS. El flujo neto BESS y el acumulado solo
        usan el incremental BESS menos OPEX.
      </p>
    </section>
  );
}

function Th({
  children,
  align = "right",
  variante,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  variante?: "informativo";
}) {
  const color =
    variante === "informativo"
      ? "text-[var(--color-text-tertiary)] font-normal"
      : "text-[var(--color-text-primary)] font-medium";
  return (
    <th
      className={`bg-[var(--color-bg-secondary)] px-3.5 py-2.5 text-[10px] uppercase tracking-[0.4px] ${color} ${
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
  variante,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  emphasis?: boolean;
  variante?: "informativo";
}) {
  const color = emphasis
    ? "font-semibold text-[#065F46]"
    : variante === "informativo"
      ? "text-[var(--color-text-tertiary)]"
      : "text-[var(--color-text-primary)]";
  return (
    <td
      className={`px-3.5 py-2 tabular-nums ${
        align === "left" ? "text-left" : "text-right"
      } ${color}`}
    >
      {children}
    </td>
  );
}
