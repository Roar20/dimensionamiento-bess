import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EquipoBess } from "@/data/catalogo-hyperstrong";
import {
  formatearEficienciaMax,
  formatearVidaUtil,
} from "@/data/formatear-equipo";

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

interface Props {
  equipo: EquipoBess | null;
  abierto: boolean;
  onOpenChange: (next: boolean) => void;
}

export function FichaTecnicaModal({ equipo, abierto, onOpenChange }: Props) {
  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[560px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipo ? equipo.nombre : "Ficha técnica"}
          </DialogTitle>
        </DialogHeader>
        {equipo ? <FichaContenido equipo={equipo} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function FichaContenido({ equipo }: { equipo: EquipoBess }) {
  const [tMin, tMax] = equipo.temperaturaOpC;
  const [vMin, vMax] = equipo.rangoVoltajeDcV;
  const [w, d, h] = equipo.dimensionesMm;

  return (
    <div className="space-y-5 text-[13px] text-[var(--color-text-secondary)]">
      <p className="text-[12px] text-[var(--color-text-tertiary)]">
        {equipo.modeloDetalle}
      </p>

      <Seccion titulo="DC">
        <Fila label="Energía nominal" valor={`${FORMATO_1DEC.format(equipo.energiaKwh)} kWh`} />
        <Fila label="Configuración celdas" valor={equipo.configuracionCeldas} />
        <Fila label="Voltaje DC nominal" valor={`${equipo.voltajeDcV} V`} />
        <Fila
          label="Rango de voltaje DC"
          valor={`${vMin}–${vMax} V`}
        />
        {equipo.potenciaKwDc !== null ? (
          <Fila
            label="Potencia DC"
            valor={`${FORMATO_ENTERO.format(equipo.potenciaKwDc)} kW`}
          />
        ) : null}
      </Seccion>

      <Seccion titulo="AC">
        {equipo.potenciaKvaAc !== null ? (
          <Fila
            label="Potencia nominal"
            valor={`${FORMATO_ENTERO.format(equipo.potenciaKvaAc)} kVA`}
          />
        ) : (
          <Fila label="Potencia nominal" valor="DC version" />
        )}
        <Fila
          label="Eficiencia máxima"
          valor={formatearEficienciaMax(equipo.eficienciaMax)}
        />
      </Seccion>

      <Seccion titulo="General">
        <Fila
          label="Temperatura de operación"
          valor={`${tMin} °C a ${tMax} °C`}
        />
        <Fila label="Refrigeración" valor={equipo.refrigeracion} />
        <Fila
          label="Vida útil declarada"
          valor={formatearVidaUtil(equipo.vidaUtilAnos)}
        />
        <Fila
          label="Dimensiones (W × D × H)"
          valor={`${FORMATO_ENTERO.format(w)} × ${FORMATO_ENTERO.format(d)} × ${FORMATO_ENTERO.format(h)} mm`}
        />
        <Fila label="Peso" valor={`${FORMATO_ENTERO.format(equipo.pesoKg)} kg`} />
        {equipo.capacidadParaleloUnidades !== null ? (
          <Fila
            label="Capacidad en paralelo"
            valor={`${equipo.capacidadParaleloUnidades} unidades`}
          />
        ) : null}
        {equipo.rteGananciaPct !== null ? (
          <Fila
            label="Ganancia RTE vs estándar"
            valor={`+${equipo.rteGananciaPct} pp`}
          />
        ) : null}
        {equipo.densidadGananciaPct !== null ? (
          <Fila
            label="Ganancia densidad energética"
            valor={`+${FORMATO_1DEC.format(equipo.densidadGananciaPct)}%`}
          />
        ) : null}
        <Fila
          label="Certificaciones"
          valor={equipo.certificaciones.join(" · ")}
        />
      </Seccion>

      <Seccion titulo="Comercial">
        <Fila
          label="Precio por unidad"
          valor={`USD ${FORMATO_ENTERO.format(equipo.precioUsdUnidad)}`}
        />
        <Fila
          label="Precio por kWh"
          valor={`USD ${FORMATO_ENTERO.format(equipo.precioUsdKwh)}`}
        />
      </Seccion>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {titulo}
      </h3>
      <dl className="grid grid-cols-1 gap-y-1.5">{children}</dl>
    </section>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[var(--color-text-tertiary)]">{label}</dt>
      <dd className="text-right tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </dd>
    </div>
  );
}
