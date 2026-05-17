import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import { SeccionCard } from "@/components/onboarding/SeccionCard";

export type ParametrosContractuales = {
  poi: string;
  instalada: string;
  zonaLmp: string;
  precioPpa: string;
};

interface Props {
  valores: ParametrosContractuales;
  onChange: (next: ParametrosContractuales) => void;
}

export function SeccionParametrosContractuales({ valores, onChange }: Props) {
  const copy = COPY_M1A.secciones.contractuales;
  const campos = copy.campos;

  return (
    <SeccionCard
      numero={copy.numero}
      titulo={copy.titulo}
      descripcion={copy.descripcion}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <CampoNumero
          id="planta-poi"
          label={campos.poi.label}
          helper={campos.poi.helper}
          placeholder={campos.poi.placeholder}
          required
          value={valores.poi}
          onChange={(v) => onChange({ ...valores, poi: v })}
        />
        <CampoNumero
          id="planta-instalada"
          label={campos.instalada.label}
          helper={campos.instalada.helper}
          placeholder={campos.instalada.placeholder}
          required
          value={valores.instalada}
          onChange={(v) => onChange({ ...valores, instalada: v })}
        />
        <CampoTexto
          id="planta-zona-lmp"
          label={campos.zonaLmp.label}
          helper={campos.zonaLmp.helper}
          placeholder={campos.zonaLmp.placeholder}
          value={valores.zonaLmp}
          onChange={(v) => onChange({ ...valores, zonaLmp: v })}
        />
        <CampoNumero
          id="planta-precio-ppa"
          label={campos.precioPpa.label}
          helper={campos.precioPpa.helper}
          placeholder={campos.precioPpa.placeholder}
          value={valores.precioPpa}
          onChange={(v) => onChange({ ...valores, precioPpa: v })}
        />
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
}

function CampoTexto({
  id,
  label,
  helper,
  placeholder,
  required,
  value,
  onChange,
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
      />
      <p className="text-xs text-ink-helper">{helper}</p>
    </div>
  );
}

function CampoNumero(props: CampoProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>
        {props.label}
        {props.required ? (
          <span className="ml-0.5 text-status-error">*</span>
        ) : null}
      </Label>
      <Input
        id={props.id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="tabular-nums"
      />
      <p className="text-xs text-ink-helper">{props.helper}</p>
    </div>
  );
}
