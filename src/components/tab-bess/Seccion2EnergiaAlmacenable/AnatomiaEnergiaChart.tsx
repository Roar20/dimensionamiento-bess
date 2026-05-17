import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import type { ResumenCategoria } from "@/types/bess";

interface Props {
  resumenes: readonly ResumenCategoria[];
  totalSFV_mwh: number;
  seleccion: string;
}

const COLOR_PRIMARIO = "#4A7C59";
const COLOR_NEUTRO = "#94a3b8";

export function AnatomiaEnergiaChart({
  resumenes,
  totalSFV_mwh,
  seleccion,
}: Props) {
  const copy = COPY_M3.seccion2Energia.anatomia;
  const datos = resumenes.map((r) => ({
    nombre: r.categoria.etiqueta,
    tipo: r.categoria.tipo,
    valor: r.total_mwh,
    porcentaje: r.porcentaje,
    descripcion: r.categoria.descripcion,
  }));
  const dominioMax = Math.max(totalSFV_mwh, ...datos.map((d) => d.valor), 1);

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold text-ink-primary">
            {copy.tituloPrefijo}: {copy.tituloSufijo(totalSFV_mwh)}
          </h3>
          <p className="text-sm text-ink-helper">{copy.subtitulo}</p>
        </header>

        <div className="h-[260px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={datos}
              layout="vertical"
              margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                type="number"
                domain={[0, dominioMax]}
                tickFormatter={(v) => `${Math.round(Number(v))}`}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={220}
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <Tooltip content={<TooltipAnatomia />} />
              <Bar
                dataKey="valor"
                radius={[0, 4, 4, 0]}
                label={{
                  position: "right",
                  formatter: (v: number) =>
                    `${Math.round(Number(v)).toLocaleString("es-MX")} MWh`,
                  fontSize: 11,
                  fill: "#475569",
                }}
              >
                {datos.map((d) => (
                  <Cell
                    key={d.tipo}
                    fill={
                      seleccion === "ninguna" || seleccion === d.tipo
                        ? COLOR_PRIMARIO
                        : COLOR_NEUTRO
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-1.5 text-xs text-ink-secondary">
          {resumenes.map((r) => (
            <li key={r.categoria.tipo}>
              <span className="font-medium text-ink-primary">
                {r.categoria.etiqueta}:
              </span>{" "}
              {r.categoria.descripcion}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

type DatoBar = {
  nombre: string;
  tipo: string;
  valor: number;
  porcentaje: number;
  descripcion: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: DatoBar }>;
};

function TooltipAnatomia({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]!.payload;
  return (
    <div className="max-w-xs rounded-lg border border-slate-700 bg-brand-header px-3 py-2 shadow-lg">
      <div className="mb-1 text-xs font-medium text-slate-300">{d.nombre}</div>
      <div className="mb-1 text-sm font-semibold text-white tabular-nums">
        {Math.round(d.valor).toLocaleString("es-MX")} MWh (
        {d.porcentaje.toFixed(0)}%)
      </div>
      <div className="text-xs text-slate-300">{d.descripcion}</div>
    </div>
  );
}
