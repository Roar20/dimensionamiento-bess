import { LecturaEjecutiva } from "@/components/ui/LecturaEjecutiva";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  energiaCapturadaMwh: number;
  ciclosAnuales: number;
  paybackAnios: number | null;
  estrategia: "greedy" | "arbitraje";
}

export function LecturaEjecutivaSFVBess({
  energiaCapturadaMwh,
  ciclosAnuales,
  paybackAnios,
  estrategia,
}: Props) {
  const texto = COPY_SFV_BESS.lecturaEjecutiva.plantilla({
    energia_capturada_mwh: energiaCapturadaMwh,
    ciclos: ciclosAnuales,
    payback_anios: paybackAnios,
    estrategia:
      estrategia === "greedy"
        ? COPY_SFV_BESS.estrategias.greedy
        : COPY_SFV_BESS.estrategias.arbitraje,
  });
  return <LecturaEjecutiva texto={texto} />;
}
