import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import { SeccionCard } from "@/components/onboarding/SeccionCard";

interface Props {
  capacidad_poi_kw: number | null;
  capacidad_instalada_kw: number | null;
  zona_lmp: string;
  precio_ppa_mxn_mwh: number | null;
  errorPrecioPpa: string | null;
  onChange: (
    parcial: Partial<{
      capacidad_poi_kw: number | null;
      capacidad_instalada_kw: number | null;
      zona_lmp: string;
      precio_ppa_mxn_mwh: number | null;
    }>
  ) => void;
}

export function SeccionParametrosContractuales({
  capacidad_poi_kw,
  capacidad_instalada_kw,
  zona_lmp,
  precio_ppa_mxn_mwh,
  errorPrecioPpa,
  onChange,
}: Props) {
  const copy = COPY_M1A.secciones.contractuales;
  const campos = copy.campos;

  return (
    <SeccionCard numero={copy.numero} titulo={copy.titulo}>
      <div className="grid gap-4 md:grid-cols-2">
        <CampoNumero
          id="planta-poi"
          label={campos.poi.label}
          placeholder={campos.poi.placeholder}
          required
          value={capacidad_poi_kw}
          onChange={(v) => onChange({ capacidad_poi_kw: v })}
        />
        <CampoNumero
          id="planta-instalada"
          label={campos.instalada.label}
          placeholder={campos.instalada.placeholder}
          required
          value={capacidad_instalada_kw}
          onChange={(v) => onChange({ capacidad_instalada_kw: v })}
        />
        <CampoTexto
          id="planta-zona-lmp"
          label={campos.zonaLmp.label}
          placeholder={campos.zonaLmp.placeholder}
          value={zona_lmp}
          onChange={(v) => onChange({ zona_lmp: v })}
        />
        <CampoNumero
          id="planta-precio-ppa"
          label={campos.precioPpa.label}
          placeholder={campos.precioPpa.placeholder}
          value={precio_ppa_mxn_mwh}
          onChange={(v) => onChange({ precio_ppa_mxn_mwh: v })}
          step="0.01"
          error={errorPrecioPpa}
        />
      </div>
    </SeccionCard>
  );
}

interface CampoTextoProps {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (next: string) => void;
}

function CampoTexto({
  id,
  label,
  placeholder,
  required,
  value,
  onChange,
}: CampoTextoProps) {
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
      />
    </div>
  );
}

interface CampoNumeroProps {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  value: number | null;
  onChange: (next: number | null) => void;
  step?: string;
  error?: string | null;
}

function CampoNumero({
  id,
  label,
  placeholder,
  required,
  value,
  onChange,
  step = "any",
  error,
}: CampoNumeroProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-ink-helper">*</span> : null}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="tabular-nums"
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
