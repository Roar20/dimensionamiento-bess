import { Button } from "@/components/ui/button";
import type { EquipoBess } from "@/data/catalogo-hyperstrong";

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface Props {
  equipo: EquipoBess;
  onAbrirFicha: (equipo: EquipoBess) => void;
}

export function EquipoCard({ equipo, onAbrirFicha }: Props) {
  const potencia =
    equipo.potenciaKvaAc !== null
      ? `${FORMATO_ENTERO.format(equipo.potenciaKvaAc)} kVA`
      : equipo.potenciaKwDc !== null
        ? `${FORMATO_ENTERO.format(equipo.potenciaKwDc)} kW`
        : "—";
  const [w, d, h] = equipo.dimensionesMm;
  const aplicable = equipo.aplicableTequila;

  return (
    <article
      data-equipo-id={equipo.id}
      className={[
        "flex flex-col rounded-md bg-white p-5 transition-colors",
        aplicable
          ? "border-[2px] border-[var(--color-primary)]"
          : "border-[0.5px] border-[var(--color-border-light)]",
      ].join(" ")}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-medium text-[var(--color-text-primary)]">
            {equipo.nombre}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-tertiary)]">
            {equipo.modelo}
          </p>
        </div>
        {aplicable ? (
          <span className="shrink-0 rounded-full border-[0.5px] border-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary-dark)]">
            Aplicable a Tequila
          </span>
        ) : null}
      </header>

      <dl className="mb-4 grid grid-cols-2 gap-x-3 gap-y-3 text-[12px]">
        <Spec label="Energía" valor={`${FORMATO_1DEC.format(equipo.energiaKwh)} kWh`} />
        <Spec label="Potencia" valor={potencia} />
        <Spec
          label="Eficiencia"
          valor={`${equipo.eficienciaMax}%`}
        />
        <Spec label="Vida útil" valor={`${equipo.vidaUtilAnos} años`} />
      </dl>

      <dl className="mb-5 space-y-1.5 border-t-[0.5px] border-[var(--color-border-light)] pt-3 text-[12px]">
        <Meta label="Configuración" valor={equipo.configuracionCeldas} />
        <Meta label="Voltaje DC" valor={`${equipo.voltajeDcV} V`} />
        <Meta
          label="Dimensiones"
          valor={`${FORMATO_ENTERO.format(w)} × ${FORMATO_ENTERO.format(d)} × ${FORMATO_ENTERO.format(h)} mm`}
        />
        <Meta label="Peso" valor={`${FORMATO_ENTERO.format(equipo.pesoKg)} kg`} />
        <Meta
          label="USD/unidad"
          valor={FORMATO_ENTERO.format(equipo.precioUsdUnidad)}
        />
        <Meta
          label="USD/kWh"
          valor={FORMATO_ENTERO.format(equipo.precioUsdKwh)}
        />
      </dl>

      <div className="mt-auto flex gap-2">
        <Button
          type="button"
          onClick={() => onAbrirFicha(equipo)}
          className="flex-1 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
        >
          Ficha técnica
        </Button>
        <a
          href={equipo.datasheetUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex flex-1 items-center justify-center rounded-input border-[0.5px] border-[var(--color-border-medium)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
        >
          PDF
        </a>
      </div>
    </article>
  );
}

function Spec({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15px] font-medium tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </dd>
    </div>
  );
}

function Meta({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--color-text-tertiary)]">{label}</dt>
      <dd className="text-right tabular-nums text-[var(--color-text-secondary)]">
        {valor}
      </dd>
    </div>
  );
}
