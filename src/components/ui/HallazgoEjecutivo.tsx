import { Link } from "react-router-dom";

interface Props {
  titulo: string;
  parrafos: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Card de hallazgo ejecutivo para empty states informativos del sistema
 * de diseño. Reemplaza grids de KPIs o charts cuando el resultado
 * cuantitativo no aplica y conviene reorientar la lectura al hallazgo.
 *
 * - Estructura: título + 1..N párrafos + CTA opcional.
 * - Sin label de categoría arriba (decisión de diseño: menos elementos
 *   visuales compitiendo).
 */
export function HallazgoEjecutivo({
  titulo,
  parrafos,
  ctaLabel,
  ctaHref,
}: Props) {
  const cta = ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : null;

  return (
    <section
      role="note"
      className="mb-8 rounded-md border-[0.5px] border-[var(--color-border-light)] bg-[var(--color-bg-card)] p-6"
    >
      <h3 className="mb-3 text-base font-medium text-[var(--color-text-primary)]">
        {titulo}
      </h3>
      <div className="space-y-3 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        {parrafos.map((parrafo, idx) => {
          const esUltimo = idx === parrafos.length - 1;
          if (esUltimo && cta) {
            return (
              <p key={idx}>
                {parrafo}{" "}
                <Link
                  to={cta.href}
                  className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  {cta.label}
                </Link>
              </p>
            );
          }
          return <p key={idx}>{parrafo}</p>;
        })}
      </div>
    </section>
  );
}
