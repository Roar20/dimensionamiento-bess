import { useEffect, useState } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { TipoCambioInput } from "@/components/bess/TipoCambioInput";
import { TOOLTIPS_SFV_BESS } from "@/data/tooltips-sfv-bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { usePreciosProxy, type PrecioKey } from "@/hooks/usePreciosProxy";
import { useTipoCambio } from "@/hooks/useTipoCambio";

import { BannerProxyPrecios } from "./BannerProxyPrecios";

const FORMATO_ENTERO_2DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PanelPreciosEditables() {
  const { precios, setPrecio, reset, esProxy } = usePreciosProxy();
  const { tipoCambio, setTipoCambio } = useTipoCambio();
  const copy = COPY_SFV_BESS.paneles.precios;

  return (
    <section className="mb-8 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {copy.titulo}
        </h2>
      </header>
      <BannerProxyPrecios esProxy={esProxy} onReset={reset} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <CampoTipoCambio valor={tipoCambio} onChange={setTipoCambio} />
        <CampoPrecio
          campo="energia_mxn_mwh"
          label={copy.energia}
          unidad={copy.energiaUnidad}
          tooltip={TOOLTIPS_SFV_BESS.precio_energia}
          valor={precios.energia_mxn_mwh}
          onChange={(n) => setPrecio("energia_mxn_mwh", n)}
        />
        <CampoPrecio
          campo="potencia_firme_mxn_mw_mes"
          label={copy.potenciaFirme}
          unidad={copy.potenciaFirmeUnidad}
          tooltip={TOOLTIPS_SFV_BESS.precio_potencia_firme}
          valor={precios.potencia_firme_mxn_mw_mes}
          onChange={(n) => setPrecio("potencia_firme_mxn_mw_mes", n)}
        />
        <CampoPrecio
          campo="cel_mxn"
          label={copy.cel}
          unidad={copy.celUnidad}
          tooltip={TOOLTIPS_SFV_BESS.precio_cel}
          valor={precios.cel_mxn}
          onChange={(n) => setPrecio("cel_mxn", n)}
        />
      </div>
    </section>
  );
}

function CampoTipoCambio({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (n: number) => boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)]">
        Tipo de cambio
      </p>
      <TipoCambioInput valor={valor} onChange={onChange} />
    </div>
  );
}

interface CampoPrecioProps {
  campo: PrecioKey;
  label: string;
  unidad: string;
  tooltip: string;
  valor: number;
  onChange: (n: number) => boolean;
}

function CampoPrecio({
  campo,
  label,
  unidad,
  tooltip,
  valor,
  onChange,
}: CampoPrecioProps) {
  const [buffer, setBuffer] = useState<string>(formatear(valor));

  useEffect(() => {
    setBuffer(formatear(valor));
  }, [valor]);

  const commit = () => {
    const parsed = Number(buffer.replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0 && onChange(parsed)) {
      setBuffer(formatear(parsed));
    } else {
      setBuffer(formatear(valor));
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <label
          htmlFor={`precio-${campo}`}
          className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
        <InfoTooltip texto={tooltip} etiqueta={`Trazabilidad: ${label}`} />
      </div>
      <div className="flex items-center gap-2">
        <input
          id={`precio-${campo}`}
          type="text"
          inputMode="decimal"
          value={buffer}
          onChange={(e) => setBuffer(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-8 flex-1 rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-right text-[13px] tabular-nums text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
          aria-label={`${label} en ${unidad}`}
        />
        <span className="shrink-0 text-[11px] text-[var(--color-text-tertiary)]">
          {unidad}
        </span>
      </div>
    </div>
  );
}

function formatear(n: number): string {
  return FORMATO_ENTERO_2DEC.format(n);
}
