import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

interface Props {
  nombrePlanta: string | null;
  anio: number;
}

export function MetodologiaSFVBess({ nombrePlanta, anio }: Props) {
  const planta = nombrePlanta ?? "la planta";
  return (
    <MetodologiaDetalles>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Fuente de datos:
        </strong>{" "}
        registros horarios SFV {planta} año {anio}, provistos por Soluciones
        MHG.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Despacho horario:
        </strong>{" "}
        simulación greedy y arbitraje sobre Δt = 1 h. Greedy carga apenas hay
        energía en la categoría y descarga apenas la categoría se agota.
        Arbitraje carga durante el día y descarga exclusivamente en hora-punta
        CFE (18:00–22:00).
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Parámetros operativos:
        </strong>{" "}
        DoD 95%, SoC mínimo 5%, RTE del datasheet por equipo. SOH degrada
        según curva Hyperstrong; el cálculo financiero riguroso de SOH y OPEX
        vive en Tab Análisis financiero.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Ingreso anual estimado:
        </strong>{" "}
        descargado anual × (precio energía PPA + precio CEL). Potencia firme
        capturada en el panel de precios pero{" "}
        <em>no integrada todavía</em> al cálculo de ingreso; entra en próxima
        versión con motor de potencia firme dedicado.
      </p>
      <p>
        <strong className="font-medium text-[var(--color-text-primary)]">
          Payback preliminar:
        </strong>{" "}
        CAPEX / ingreso anual. Sin descuento, sin OPEX, sin fade de SOH. El
        cálculo financiero descontado vive en Tab Análisis financiero.
      </p>
    </MetodologiaDetalles>
  );
}
