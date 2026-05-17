import { COPY_M5 } from "@/lib/copy/modulo-5";

interface Props {
  capacidad_poi_kw: number;
}

export function HeroNarrativo({ capacidad_poi_kw }: Props) {
  const copy = COPY_M5.hero;
  return (
    <section className="border-y border-slate-800 bg-gradient-to-br from-brand-header to-[#264760] px-6 py-8 text-white">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-3 text-2xl font-semibold leading-tight md:text-3xl">
          {copy.titulo}
        </h2>
        <p className="max-w-4xl text-sm leading-relaxed text-slate-200 md:text-base">
          {copy.parrafo1(capacidad_poi_kw)}
        </p>
        <p className="mt-2 max-w-4xl text-sm text-slate-300 md:text-base">
          {copy.parrafo2}
        </p>
      </div>
    </section>
  );
}
