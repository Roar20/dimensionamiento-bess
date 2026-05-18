interface Props {
  etiqueta: string;
  valor: string;
  acento?: "default" | "primario" | "alerta";
}

export function KPICardSFVBess({ etiqueta, valor, acento = "default" }: Props) {
  const color =
    acento === "primario"
      ? "text-action"
      : acento === "alerta"
        ? "text-status-warning"
        : "text-ink-primary";
  return (
    <div className="rounded-md bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] uppercase tracking-wide text-ink-helper">
        {etiqueta}
      </p>
      <p className={`text-base font-medium tabular-nums ${color}`}>{valor}</p>
    </div>
  );
}
