import { forwardRef } from "react";

import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import {
  CATALOGO_HYPERSTRONG,
  costoPorKwh,
  densidadEnergetica,
  duracionNominalHoras,
  huellaEnSueloM2,
  type EquipoBESS,
} from "@/lib/bess/catalogo-hyperstrong";

import { BotonDescargarDatasheet } from "./BotonDescargarDatasheet";

interface Props {
  equipoRecomendadoId: string | null;
  abrirEquipoId: string | null;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const FORMATO_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const Seccion5FichasDetalladas = forwardRef<HTMLDivElement, Props>(
  function Seccion5FichasDetalladas(
    { equipoRecomendadoId, abrirEquipoId },
    ref
  ) {
    const copy = COPY_M3.seccion5;

    return (
      <section ref={ref} className="space-y-5">
        <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

        <div className="space-y-3">
          {CATALOGO_HYPERSTRONG.map((equipo) => (
            <FichaEquipo
              key={equipo.id}
              equipo={equipo}
              esRecomendado={equipo.id === equipoRecomendadoId}
              abierto={equipo.id === abrirEquipoId}
            />
          ))}
        </div>
      </section>
    );
  }
);

function FichaEquipo({
  equipo,
  esRecomendado,
  abierto,
}: {
  equipo: EquipoBESS;
  esRecomendado: boolean;
  abierto: boolean;
}) {
  const copy = COPY_M3.seccion5;
  return (
    <details
      id={`equipo-${equipo.id}`}
      open={abierto || esRecomendado}
      className="rounded-card border border-brand-cardBorder bg-white shadow-card open:shadow-md"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-ink-primary">
            {equipo.nombre_completo}
          </span>
          {esRecomendado ? (
            <span className="rounded-full bg-action px-2 py-0.5 text-xs font-medium text-white">
              {COPY_M3.seccion2.badgeRecomendado}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-ink-helper">
          {FORMATO_ENTERO.format(equipo.kw_ac)} kW ·{" "}
          {FORMATO_ENTERO.format(equipo.kwh)} kWh
        </span>
      </summary>
      <div className="space-y-5 border-t border-brand-cardBorder p-5">
        <Grupo titulo={copy.grupos.potenciaEnergia}>
          <Dato label="Modelo" valor={equipo.modelo} />
          <Dato
            label="Potencia AC"
            valor={`${FORMATO_ENTERO.format(equipo.kw_ac)} kW`}
          />
          <Dato
            label="Energía nominal"
            valor={`${FORMATO_ENTERO.format(equipo.kwh)} kWh`}
          />
          <Dato
            label="Duración nominal"
            valor={`${duracionNominalHoras(equipo).toFixed(1)} h`}
          />
          <Dato
            label="Eficiencia máxima (RTE)"
            valor={`${Math.round(equipo.eficiencia_max * 100)}%`}
          />
          <Dato
            label="Vida útil mínima"
            valor={`${equipo.vida_util_anios} años`}
          />
        </Grupo>

        <Grupo titulo={copy.grupos.bateria}>
          <Dato label="Tipo de batería" valor={equipo.tipo_bateria} />
          <Dato label="Configuración" valor={equipo.config_bateria} />
          <Dato
            label="Voltaje DC nominal"
            valor={`${FORMATO_ENTERO.format(equipo.voltaje_dc)} V`}
          />
          <Dato
            label="Rango voltaje DC"
            valor={`${FORMATO_ENTERO.format(equipo.voltaje_op_min_dc)}–${FORMATO_ENTERO.format(equipo.voltaje_op_max_dc)} V`}
          />
        </Grupo>

        <Grupo titulo={copy.grupos.ambiente}>
          <Dato
            label="Temperatura operación"
            valor={`${equipo.temperatura_op_min_c}°C a ${equipo.temperatura_op_max_c}°C`}
          />
          <Dato
            label="Protección IP (batería / gabinete)"
            valor={`${equipo.ip_rating_bateria} / ${equipo.ip_rating_gabinete}`}
          />
          <Dato label="Refrigeración" valor={equipo.cooling_method} />
        </Grupo>

        <Grupo titulo={copy.grupos.fisicas}>
          <Dato
            label="Dimensiones (W×D×H)"
            valor={`${(equipo.ancho_mm / 1000).toFixed(2)}×${(equipo.profundidad_mm / 1000).toFixed(2)}×${(equipo.alto_mm / 1000).toFixed(2)} m`}
          />
          <Dato
            label="Huella en suelo"
            valor={`${huellaEnSueloM2(equipo).toFixed(2)} m²`}
          />
          <Dato
            label="Densidad energética"
            valor={`${FORMATO_ENTERO.format(densidadEnergetica(equipo))} kWh/m²`}
          />
          <Dato
            label="Peso"
            valor={`${FORMATO_ENTERO.format(equipo.peso_kg)} kg`}
          />
        </Grupo>

        <Grupo titulo={copy.grupos.conectividad}>
          <Dato
            label="Comunicación"
            valor={equipo.comunicaciones.join(" / ")}
          />
          <DatoLargo
            label="Certificaciones"
            valor={equipo.certificaciones.join(", ")}
          />
        </Grupo>

        <Grupo titulo={copy.grupos.comercial}>
          <Dato label="Precio" valor={FORMATO_USD.format(equipo.precio_usd)} />
          <Dato
            label="Costo unitario"
            valor={`${FORMATO_USD.format(costoPorKwh(equipo))}/kWh`}
          />
        </Grupo>

        <div>
          <BotonDescargarDatasheet
            url={equipo.datasheet_pdf}
            nombreArchivo={`${equipo.id}.pdf`}
          />
        </div>
      </div>
    </details>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs uppercase tracking-wide text-ink-helper">
        {titulo}
      </h4>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-1 text-sm">
      <dt className="text-ink-helper">{label}</dt>
      <dd className="text-right font-medium text-ink-primary tabular-nums">
        {valor}
      </dd>
    </div>
  );
}

function DatoLargo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="space-y-1 border-b border-slate-100 py-1 text-sm sm:col-span-2">
      <dt className="text-ink-helper">{label}</dt>
      <dd className="text-ink-secondary">{valor}</dd>
    </div>
  );
}
