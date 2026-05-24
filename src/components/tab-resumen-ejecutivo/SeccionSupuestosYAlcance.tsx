import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";

/**
 * Sección 5 del tab Resumen Ejecutivo: "Supuestos y alcance". Tiene
 * presencia propia (no escondida en accordion ni minimizada como pie de
 * componente). Los tres disclaimers están despersonalizados por
 * diseño: nombran roles ("offtaker"), no personas.
 */
export function SeccionSupuestosYAlcance() {
  const copy = COPY_RESUMEN_EJECUTIVO.supuestos;
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {copy.titulo}
      </h3>
      <p className="mb-4 max-w-[680px] text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        {copy.intro}
      </p>
      <ul className="flex flex-col gap-3">
        {copy.items.map((item) => (
          <li
            key={item.etiqueta}
            className="rounded-md border-[0.5px] border-l-[3px] border-l-[var(--color-warning)] border-[var(--color-border-light)] bg-white px-4 py-3"
          >
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
              {item.etiqueta}
            </p>
            <p className="text-[13px] leading-[1.55] text-[var(--color-text-primary)]">
              {item.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
