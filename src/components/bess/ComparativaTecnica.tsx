import { CATALOGO_HYPERSTRONG, type EquipoBess } from "@/data/catalogo-hyperstrong";

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type Fila = {
  label: string;
  valor: (e: EquipoBess) => string;
};

const FILAS: readonly Fila[] = [
  {
    label: "Energía nominal",
    valor: (e) => `${FORMATO_1DEC.format(e.energiaKwh)} kWh`,
  },
  {
    label: "Potencia nominal",
    valor: (e) =>
      e.potenciaKvaAc !== null
        ? `${FORMATO_ENTERO.format(e.potenciaKvaAc)} kVA AC`
        : e.potenciaKwDc !== null
          ? `${FORMATO_ENTERO.format(e.potenciaKwDc)} kW DC`
          : "—",
  },
  { label: "Configuración celdas", valor: (e) => e.configuracionCeldas },
  { label: "Voltaje DC nominal", valor: (e) => `${e.voltajeDcV} V` },
  { label: "Eficiencia máxima", valor: (e) => `${e.eficienciaMax}%` },
  {
    label: "Temperatura operación",
    valor: (e) => `${e.temperaturaOpC[0]} °C a ${e.temperaturaOpC[1]} °C`,
  },
  { label: "Vida útil declarada", valor: (e) => `${e.vidaUtilAnos} años` },
  { label: "Refrigeración", valor: (e) => e.refrigeracion },
  {
    label: "Capacidad paralelo",
    valor: (e) =>
      e.capacidadParaleloUnidades !== null
        ? `${e.capacidadParaleloUnidades} unidades`
        : "n/a",
  },
  {
    label: "Costo USD/kWh",
    valor: (e) => FORMATO_ENTERO.format(e.precioUsdKwh),
  },
];

export function ComparativaTecnica() {
  return (
    <section className="mb-8">
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Comparativa técnica
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Plataformas Hyperstrong lado a lado · 10 parámetros declarados
        </p>
      </header>
      <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <Th align="left">Parámetro</Th>
              {CATALOGO_HYPERSTRONG.map((e) => (
                <Th key={e.id}>{e.nombre.replace("HyperCube C&I II ", "").replace("Hyper", "")}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((fila) => (
              <tr
                key={fila.label}
                className="border-t-[0.5px] border-[var(--color-border-light)]"
              >
                <Td align="left" emphasis>
                  {fila.label}
                </Td>
                {CATALOGO_HYPERSTRONG.map((e) => (
                  <Td key={e.id}>{fila.valor(e)}</Td>
                ))}
              </tr>
            ))}
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
      className={`px-3.5 py-2.5 tabular-nums ${
        align === "left" ? "text-left" : "text-right"
      } ${emphasis ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
    >
      {children}
    </td>
  );
}
