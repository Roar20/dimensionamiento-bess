import { COPY_M3 } from "@/lib/copy/modulo-3";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";

export function Seccion1IntroBESS() {
  const copy = COPY_M3.seccion1;
  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo}
        texto={copy.queHace.texto}
      />

      <DiagramaFlujo />

      <div className="grid gap-4 md:grid-cols-2">
        <Bloque titulo={copy.porQue.titulo} texto={copy.porQue.texto} />
        <BloqueLista
          titulo={copy.familias.titulo}
          items={copy.familias.items}
        />
      </div>
    </section>
  );
}

function Bloque({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-card border border-brand-cardBorder bg-white p-5 shadow-card">
      <h3 className="text-sm font-medium text-ink-primary">{titulo}</h3>
      <p className="mt-2 text-sm text-ink-secondary">{texto}</p>
    </div>
  );
}

function BloqueLista({
  titulo,
  items,
}: {
  titulo: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-card border border-brand-cardBorder bg-white p-5 shadow-card">
      <h3 className="text-sm font-medium text-ink-primary">{titulo}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-secondary">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DiagramaFlujo() {
  const copy = COPY_M3.seccion1.diagrama;
  return (
    <div className="rounded-card border border-brand-cardBorder bg-white p-6 shadow-card">
      <svg
        viewBox="0 0 720 180"
        className="mx-auto w-full max-w-3xl"
        role="img"
        aria-label="Flujo: SFV genera, BESS almacena, red recibe en hora-punta"
      >
        <Nodo
          x={40}
          label={copy.sfv}
          sub={copy.sfvSub}
          color="var(--color-warning)"
        />
        <Flecha x1={200} x2={280} />
        <Nodo
          x={290}
          label={copy.bess}
          sub={copy.bessSub}
          color="var(--color-primary)"
        />
        <Flecha x1={450} x2={530} />
        <Nodo
          x={540}
          label={copy.red}
          sub={copy.redSub}
          color="var(--color-text-primary)"
        />
      </svg>
    </div>
  );
}

function Nodo({
  x,
  label,
  sub,
  color,
}: {
  x: number;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={40}
        width={160}
        height={70}
        rx={10}
        fill="white"
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={x + 80}
        y={72}
        textAnchor="middle"
        fontSize={16}
        fontWeight="600"
        fill={color}
      >
        {label}
      </text>
      <text
        x={x + 80}
        y={94}
        textAnchor="middle"
        fontSize={11}
        fill="#475569"
      >
        {sub}
      </text>
    </g>
  );
}

function Flecha({ x1, x2 }: { x1: number; x2: number }) {
  return (
    <g>
      <line
        x1={x1}
        x2={x2 - 8}
        y1={75}
        y2={75}
        stroke="#94a3b8"
        strokeWidth={2}
      />
      <polygon
        points={`${x2 - 8},69 ${x2},75 ${x2 - 8},81`}
        fill="#94a3b8"
      />
    </g>
  );
}
