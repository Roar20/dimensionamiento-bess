import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TabBESS } from "@/components/tab-bess/TabBESS";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function BESS() {
  const { datos } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (!datos) navigate("/", { replace: true });
  }, [datos, navigate]);

  if (!datos) return null;

  return <TabBESS config={datos.config} />;
}
