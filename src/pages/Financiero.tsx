import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/shell/PageHeader";
import { TabFinanciero } from "@/components/tab-financiero/TabFinanciero";
import { useDatosSFV } from "@/hooks/useDatosSFV";

export function Financiero() {
  const { datos } = useDatosSFV();
  const navigate = useNavigate();

  useEffect(() => {
    if (!datos) navigate("/", { replace: true });
  }, [datos, navigate]);

  if (!datos) return null;

  return (
    <div className="mx-auto max-w-[1080px] px-10 pb-16 pt-8">
      <PageHeader hayDatos />
      <TabFinanciero datos={datos} />
    </div>
  );
}
