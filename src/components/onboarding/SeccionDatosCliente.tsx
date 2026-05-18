import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import { SeccionCard } from "@/components/onboarding/SeccionCard";

interface Props {
  nombre: string;
  cliente: string;
  ubicacion: string;
  onChange: (
    parcial: Partial<{ nombre: string; cliente: string; ubicacion: string }>
  ) => void;
}

export function SeccionDatosCliente({
  nombre,
  cliente,
  ubicacion,
  onChange,
}: Props) {
  const copy = COPY_M1A.secciones.cliente;
  const campos = copy.campos;

  return (
    <SeccionCard numero={copy.numero} titulo={copy.titulo}>
      <div className="space-y-4">
        <Campo
          id="planta-nombre"
          label={campos.nombre.label}
          placeholder={campos.nombre.placeholder}
          required
          value={nombre}
          onChange={(v) => onChange({ nombre: v })}
          maxLength={80}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Campo
            id="planta-cliente"
            label={campos.cliente.label}
            placeholder={campos.cliente.placeholder}
            value={cliente}
            onChange={(v) => onChange({ cliente: v })}
            maxLength={120}
          />
          <Campo
            id="planta-ubicacion"
            label={campos.ubicacion.label}
            placeholder={campos.ubicacion.placeholder}
            value={ubicacion}
            onChange={(v) => onChange({ ubicacion: v })}
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
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
}

function Campo({
  id,
  label,
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
        {required ? <span className="ml-0.5 text-ink-helper">*</span> : null}
      </Label>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
      />
    </div>
  );
}
