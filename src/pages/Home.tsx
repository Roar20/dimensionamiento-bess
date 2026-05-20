import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Onboarding } from "@/components/onboarding/Onboarding";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function Home() {
  const { datos, cargando, error, cargar } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (datos) navigate("/sfv", { replace: true });
  }, [datos, navigate]);

  return <Onboarding cargando={cargando} error={error} cargar={cargar} />;
}
