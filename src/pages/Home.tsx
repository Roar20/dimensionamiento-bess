import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Onboarding } from "@/components/onboarding/Onboarding";
import { useDatosSFV } from "@/hooks/useDatosSFV";
import { limpiarPeriodoActivoPersistido } from "@/hooks/usePeriodoActivo";

export function Home() {
  const { datos, cargando, error, cargar, rehidratar, limpiar } =
    useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (datos) navigate("/sfv", { replace: true });
  }, [datos, navigate]);

  return (
    <Onboarding
      hayDatosPersistidos={!!datos}
      cargando={cargando}
      error={error}
      cargar={cargar}
      onRehidratar={() => {
        rehidratar();
        navigate("/sfv");
      }}
      onBorrar={() => {
        limpiar();
        limpiarPeriodoActivoPersistido();
      }}
    />
  );
}
