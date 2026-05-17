import type { TooltipProps } from "recharts";

export type ItemTooltip = {
  label: string;
  valor: string;
  color?: string;
};

type RechartsPayloadItem = TooltipProps<number, string>["payload"] extends
  | infer P
  | undefined
  ? P extends ReadonlyArray<infer Item>
    ? Item
    : never
  : never;

type Props = TooltipProps<number, string> & {
  formatear: (payload: readonly RechartsPayloadItem[]) => ItemTooltip[];
  titulo?: (label: string | undefined) => string;
};

export function TooltipRecharts({
  active,
  payload,
  label,
  formatear,
  titulo,
}: Props) {
  if (!active || !payload || payload.length === 0) return null;

  const items = formatear(payload);
  if (items.length === 0) return null;

  return (
    <div
      role="tooltip"
      className="rounded-lg border border-slate-700 bg-brand-header px-3 py-2 shadow-lg"
    >
      {titulo && label !== undefined ? (
        <div className="mb-1.5 border-b border-slate-700 pb-1 text-xs font-medium text-slate-300">
          {titulo(String(label))}
        </div>
      ) : null}
      <div className="space-y-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              {item.color ? (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="text-slate-300">{item.label}</span>
            </div>
            <span className="font-semibold text-white tabular-nums">
              {item.valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
