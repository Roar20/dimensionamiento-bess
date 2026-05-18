import { useCallback, useRef, useState, type DragEvent } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY_M1A } from "@/lib/copy/modulo-1a";
import { SeccionCard } from "@/components/onboarding/SeccionCard";
import { cn } from "@/lib/utils";

interface Props {
  archivo: File | null;
  onArchivoChange: (file: File | null) => void;
}

export function SeccionArchivoGeneracion({ archivo, onArchivoChange }: Props) {
  const copy = COPY_M1A.secciones.archivo;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const procesar = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".xlsx")) {
        setErrorLocal(copy.dropzone.formatoNoValido);
        onArchivoChange(null);
        return;
      }
      setErrorLocal(null);
      onArchivoChange(f);
    },
    [copy.dropzone.formatoNoValido, onArchivoChange]
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    procesar(e.dataTransfer.files[0]);
  };

  return (
    <SeccionCard
      numero={copy.numero}
      titulo={copy.titulo}
      descripcion={copy.descripcion}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Zona para soltar archivo de generación"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-input border-2 border-dashed border-field-border bg-white px-6 py-10 text-center transition-colors hover:border-field-focus focus:outline-none focus-visible:border-field-focus focus-visible:ring-2 focus-visible:ring-field-focus/30",
          dragOver && "border-field-focus bg-info-bg"
        )}
      >
        {archivo ? (
          <FileSpreadsheet
            className="h-10 w-10 text-status-success"
            aria-hidden="true"
          />
        ) : (
          <Upload className="h-10 w-10 text-ink-helper" aria-hidden="true" />
        )}
        {archivo ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink-primary">
              {archivo.name}
            </p>
            <p className="text-xs text-ink-helper">
              {formatearBytes(archivo.size)}
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium text-ink-primary">
            {copy.dropzone.instruccion}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {copy.dropzone.botonSeleccionar}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => procesar(e.target.files?.[0])}
        />
      </div>
      {errorLocal ? (
        <p
          role="alert"
          className="mt-3 text-sm text-status-error"
        >
          {errorLocal}
        </p>
      ) : null}
    </SeccionCard>
  );
}

function formatearBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
