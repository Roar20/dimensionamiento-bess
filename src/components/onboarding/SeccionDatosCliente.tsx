import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import { SeccionCard } from "@/components/onboarding/SeccionCard";

export type DatosCliente = {
  nombre: string;
  cliente: string;
  ubicacion: string;
};

interface Props {
  valores: DatosCliente;
  onChange: (next: DatosCliente) => void;
}

export function SeccionDatosCliente({ valores, onChange }: Props) {
  const copy = COPY_M1A.secciones.cliente;
  const campos = copy.campos;

  return (
    <SeccionCard
      numero={copy.numero}
      titulo={copy.titulo}
      descripcion={copy.descripcion}
    >
      <div className="space-y-4">
        <Campo
          id="planta-nombre"
          label={campos.nombre.label}
          helper={campos.nombre.helper}
          placeholder={campos.nombre.placeholder}
          required
          value={valores.nombre}
          onChange={(v) => onChange({ ...valores, nombre: v })}
          maxLength={80}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Campo
            id="planta-cliente"
            label={campos.cliente.label}
            helper={campos.cliente.helper}
            placeholder={campos.cliente.placeholder}
            value={valores.cliente}
            onChange={(v) => onChange({ ...valores, cliente: v })}
            maxLength={120}
          />
          <Campo
            id="planta-ubicacion"
            label={campos.ubicacion.label}
            helper={campos.ubicacion.helper}
            placeholder={campos.ubicacion.placeholder}
            value={valores.ubicacion}
            onChange={(v) => onChange({ ...valores, ubicacion: v })}
            maxLength={120}
          />
        </div>
      </div>
    </SeccionCard>
  );
}

interface CampoProps {
  id: string;
  label: string;
  helper: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
}

function Campo({
  id,
  label,
  helper,
  placeholder,
  required,
  value,
  onChange,
  maxLength,
}: CampoProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-status-error">*</span> : null}
      </Label>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
      />
      <p className="text-xs text-ink-helper">{helper}</p>
    </div>
  );
}
