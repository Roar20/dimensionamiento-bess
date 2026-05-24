import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";

/**
 * Sección "Supuestos y alcance". Capa de honestidad metodológica del
 * documento: presencia editorial, no letra chica. Cuatro marcos con
 * separadores sutiles entre ellos, sin borde tipo warning ni acento de
 * color de alerta — el tono es serio y ejecutivo, no alarmante.
 */
export function SeccionSupuestosYAlcance() {
  const copy = COPY_RESUMEN_EJECUTIVO.supuestos;
  return (
    <section className="mb-12">
      <h3 className="mb-3 text-[17px] font-medium text-[var(--color-text-primary)]">
        {copy.titulo}
      </h3>
      <p className="mb-7 max-w-[680px] text-[14px] leading-[1.6] text-[var(--color-text-secondary)]">
        {copy.intro}
      </p>
      <dl className="flex max-w-[720px] flex-col divide-y divide-[var(--color-border-light)]">
        {copy.items.map((item) => (
          <div key={item.etiqueta} className="py-5 first:pt-0 last:pb-0">
            <dt className="mb-2 text-[14px] font-medium leading-[1.4] text-[var(--color-text-primary)]">
              {item.etiqueta}
            </dt>
            <dd className="text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
              {item.texto}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
