interface Props {
  titulo: string;
  texto: string;
}

export function NarrativaIntro({ titulo, texto }: Props) {
  return (
    <header className="space-y-2">
      <h2 className="text-xl font-medium text-ink-primary md:text-2xl">
        {titulo}
      </h2>
      <p className="max-w-3xl text-sm text-ink-secondary md:text-base">
        {texto}
      </p>
    </header>
  );
}
