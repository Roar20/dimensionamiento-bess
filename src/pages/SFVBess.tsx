import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TabSFVBess } from "@/components/tab-sfv-bess/TabSFVBess";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function SFVBess() {
  const { datos } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (!datos) navigate("/", { replace: true });
  }, [datos, navigate]);

  if (!datos) return null;
  return <TabSFVBess datos={datos} />;
}
