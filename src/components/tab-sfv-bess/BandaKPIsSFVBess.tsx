import { KpiCard } from "@/components/ui/KpiCard";
import { TOOLTIPS_SFV_BESS } from "@/data/tooltips-sfv-bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  cargadoMwh: number;
  descargadoMwh: number;
  fraccionCapturada: number;
  ciclosAnuales: number;
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function BandaKPIsSFVBess({
  cargadoMwh,
  descargadoMwh,
  fraccionCapturada,
  ciclosAnuales,
}: Props) {
  const copy = COPY_SFV_BESS.banda;
  return (
    <>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {copy.seccionLabel}
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          variant="capture"
          label={copy.energiaCapturada}
          value={FORMATO_1DEC.format(cargadoMwh)}
          unit="MWh/año"
          tooltip={TOOLTIPS_SFV_BESS.energia_capturada}
        />
        <KpiCard
          variant="capture"
          label={copy.energiaDespachada}
          value={FORMATO_1DEC.format(descargadoMwh)}
          unit="MWh/año"
          tooltip={TOOLTIPS_SFV_BESS.energia_despachada}
        />
        <KpiCard
          label={copy.fraccionCapturada}
          value={FORMATO_1DEC.format(fraccionCapturada * 100)}
          unit="%"
          tooltip={TOOLTIPS_SFV_BESS.fraccion_capturada}
        />
        <KpiCard
          label={copy.cicloAnuales}
          value={FORMATO_ENTERO.format(ciclosAnuales)}
          unit="ciclos/año"
          tooltip={TOOLTIPS_SFV_BESS.ciclos_anuales}
        />
      </div>
    </>
  );
}
