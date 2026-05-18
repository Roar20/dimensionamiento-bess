import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import type { DatosSFV, Warning } from "@/types/sfv";

interface Props {
  datos: DatosSFV;
  warnings: Warning[];
  onCambiar: () => void;
}

const formatoEntero = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const formatoUnDecimal = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function ResumenCarga({ datos, warnings, onCambiar }: Props) {
  const copy = COPY_M1A.resumen;
  const meta = datos.meta;
  const config = datos.config;

  return (
    <div className="space-y-6 pb-12">
      <section className="bg-brand-header text-brand-headerFg">
        <div className="container max-w-4xl space-y-2 py-10">
          <h1 className="text-2xl font-medium leading-tight md:text-3xl">
            {copy.titulo}
          </h1>
          <p className="max-w-2xl text-sm text-white/80 md:text-base">
            {copy.subtitulo}
          </p>
        </div>
      </section>

      <div className="container max-w-4xl space-y-5">
        <Card>
          <CardContent className="space-y-4 p-6">
            <header>
              <h2 className="text-lg font-medium text-ink-primary">
                {config.nombre}
              </h2>
              <p className="text-sm text-ink-helper">
                {[config.cliente, config.ubicacion]
                  .filter(Boolean)
                  .join(" · ") || "Sin cliente ni ubicación capturados"}
              </p>
            </header>

            <dl className="grid gap-3 sm:grid-cols-2">
              <DatoMeta
                label="Capacidad autorizada por CFE"
                valor={`${formatoEntero.format(config.capacidad_poi_kw)} kW`}
              />
              <DatoMeta
                label="Capacidad instalada actual"
                valor={`${formatoEntero.format(config.capacidad_instalada_kw)} kW`}
              />
              <DatoMeta label="Zona LMP" valor={config.zona_lmp ?? "—"} />
              <DatoMeta
                label="Precio PPA"
                valor={
                  config.precio_ppa_mxn_mwh === null
                    ? "Pendiente"
                    : `${formatoUnDecimal.format(config.precio_ppa_mxn_mwh)} MXN/MWh`
                }
              />
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label={copy.kpis.anio.label}
            sublabel={copy.kpis.anio.sublabel}
            valor={String(meta.anio)}
          />
          <Kpi
            label={copy.kpis.energiaAnual.label}
            sublabel={copy.kpis.energiaAnual.sublabel}
            valor={formatoUnDecimal.format(meta.total_energia_mwh)}
            unidad={copy.kpis.energiaAnual.unidad}
          />
          <Kpi
            label={copy.kpis.horasConGen.label}
            sublabel={copy.kpis.horasConGen.sublabel}
            valor={formatoEntero.format(meta.horas_con_generacion)}
          />
          <Kpi
            label={copy.kpis.pico.label}
            sublabel={copy.kpis.pico.sublabel}
            valor={formatoEntero.format(meta.pico_horario_kw)}
            unidad={copy.kpis.pico.unidad}
          />
        </div>

        {warnings.length > 0 ? (
          <ul className="space-y-2" aria-label="Advertencias">
            {warnings.map((w) => (
              <li
                key={w.codigo}
                className="rounded-card border border-status-warning/30 bg-amber-50 p-3 text-sm text-amber-800"
              >
                {w.mensaje}
              </li>
            ))}
          </ul>
        ) : null}

        <Card>
          <CardContent className="space-y-2 p-6">
            <h3 className="text-sm font-medium text-ink-primary">
              Archivo cargado
            </h3>
            <p className="text-sm text-ink-secondary">{meta.nombre_archivo}</p>
            <p className="text-xs text-ink-helper">
              {formatoEntero.format(meta.total_horas)} registros horarios ·
              Cargado el{" "}
              {new Date(meta.fecha_carga).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </CardContent>
        </Card>

        <div>
          <Button type="button" variant="outline" onClick={onCambiar}>
            {copy.cambiar}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DatoMeta({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-helper">
        {label}
      </dt>
      <dd className="text-sm font-medium text-ink-primary tabular-nums">
        {valor}
      </dd>
    </div>
  );
}

function Kpi({
  label,
  sublabel,
  valor,
  unidad,
}: {
  label: string;
  sublabel: string;
  valor: string;
  unidad?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-xs uppercase tracking-wide text-ink-helper">
          {label}
        </p>
        <p className="text-2xl font-medium text-ink-primary tabular-nums">
          {valor}
          {unidad ? (
            <span className="ml-1 text-sm font-medium text-ink-helper">
              {unidad}
            </span>
          ) : null}
        </p>
        <p className="text-xs text-ink-helper">{sublabel}</p>
      </CardContent>
    </Card>
  );
}
