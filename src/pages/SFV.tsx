import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TabSFV } from "@/components/tab-sfv/TabSFV";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function SFV() {
  const { datos } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (!datos) navigate("/", { replace: true });
  }, [datos, navigate]);

  if (!datos) return null;

  return <TabSFV datos={datos} />;
}
