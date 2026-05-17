import { useState } from "react";

import { Onboarding } from "@/components/onboarding/Onboarding";
import { ResumenCarga } from "@/components/onboarding/ResumenCarga";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function Home() {
  const { datos, warnings, cargando, error, cargar, rehidratar, limpiar } =
    useDatosSFV();
  const [forzarOnboarding, setForzarOnboarding] = useState(false);

  if (datos && !forzarOnboarding) {
    return (
      <ResumenCarga
        datos={datos}
        warnings={warnings}
        onCambiar={() => setForzarOnboarding(true)}
      />
    );
  }

  return (
    <Onboarding
      hayDatosPersistidos={!!datos}
      cargando={cargando}
      error={error}
      cargar={cargar}
      onRehidratar={() => {
        rehidratar();
        setForzarOnboarding(false);
      }}
      onBorrar={() => {
        limpiar();
        setForzarOnboarding(false);
      }}
    />
  );
}
