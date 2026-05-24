import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";
import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";

/**
 * Sección 6 del tab Resumen Ejecutivo: trazabilidad. Accordion colapsado
 * por diseño. Cuando se llene, documenta de qué componente del software
 * sale cada pantallazo. Los supuestos materiales viven en la sección 5,
 * no aquí.
 */
export function SeccionDeDondeSaleEsto() {
  const copy = COPY_RESUMEN_EJECUTIVO.metodologia;
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {copy.titulo}
      </h3>
      <p className="mb-3 max-w-[680px] text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        {copy.intro}
      </p>
      <MetodologiaDetalles titulo="Trazabilidad de pantallazos y cálculos">
        <p>
          <em>{copy.nota}</em>
        </p>
        <p className="mt-2">
          La sección anterior, <strong>Supuestos y alcance</strong>, concentra
          las limitaciones materiales del análisis. Esta sección complementa
          documentando origen técnico, no introduciendo nuevos supuestos.
        </p>
      </MetodologiaDetalles>
    </section>
  );
}
