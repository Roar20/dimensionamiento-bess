import { COPY_M1A } from "@/lib/copy/modulo-1a";

export function CajaComoFunciona() {
  const copy = COPY_M1A.como;
  return (
    <aside className="rounded-card border-l-4 border-info-border bg-info-bg p-5">
      <h3 className="text-sm font-semibold text-ink-primary">{copy.titulo}</h3>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-secondary">
        {copy.pasos.map((paso, idx) => (
          <li key={idx}>{paso}</li>
        ))}
      </ol>
    </aside>
  );
}
