import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/shell/PageHeader";
import { TabBESS } from "@/components/tab-bess/TabBESS";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function BESS() {
  const { datos } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (!datos) navigate("/", { replace: true });
  }, [datos, navigate]);

  if (!datos) return null;

  return (
    <div className="mx-auto max-w-[1080px] px-10 pb-16 pt-8">
      <PageHeader hayDatos />
      <TabBESS datos={datos} />
    </div>
  );
}
