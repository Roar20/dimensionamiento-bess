import { useEffect, useState } from "react";

import { validarTipoCambio } from "@/hooks/useTipoCambio";

interface Props {
  valor: number;
  onChange: (next: number) => boolean;
}

function formatear(n: number): string {
  return n.toFixed(2);
}

/**
 * Input inline para el tipo de cambio USD→MXN. Buffer local string +
 * commit en onBlur. Si el valor escrito no pasa `validarTipoCambio`,
 * revierte al último válido.
 *
 * Visual: replica el estilo de los chips de `HeaderCatalogo` (13px
 * secondary + ícono Tabler) para coherencia tipográfica.
 */
export function TipoCambioInput({ valor, onChange }: Props) {
  const [buffer, setBuffer] = useState<string>(formatear(valor));

  // Mantén el buffer en sync si el valor cambia desde fuera (p.ej. otro
  // tab del mismo navegador escribió en localStorage).
  useEffect(() => {
    setBuffer(formatear(valor));
  }, [valor]);

  const commit = () => {
    const parsed = Number(buffer);
    if (validarTipoCambio(parsed) && onChange(parsed)) {
      setBuffer(formatear(parsed));
    } else {
      setBuffer(formatear(valor));
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
      <i
        className="ti ti-currency-dollar text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      />
      <label
        htmlFor="tipo-cambio-input"
        className="text-[var(--color-text-secondary)]"
      >
        Tipo de cambio
      </label>
      <input
        id="tipo-cambio-input"
        type="text"
        inputMode="decimal"
        pattern="[0-9]+([.][0-9]{1,2})?"
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="h-7 w-[68px] rounded border-[0.5px] border-[var(--color-border-medium)] bg-white px-2 text-right text-[13px] tabular-nums text-[var(--color-text-primary)] focus:outline-none focus-visible:border-[var(--color-primary)]"
        aria-label="Tipo de cambio MXN por USD"
      />
      <span className="text-[var(--color-text-tertiary)]">MXN/USD</span>
    </span>
  );
}
