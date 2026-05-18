import { PageHeader } from "@/components/shell/PageHeader";
import { TabBessCatalogo } from "@/components/bess/TabBessCatalogo";
import { useDatosSFV } from "@/hooks/useDatosSFV";

/**
 * Página `/bess` — catálogo plano Hyperstrong, independiente del estado
 * de planta. No redirige al onboarding si `!datos` (caso de uso: un
 * comercial muestra equipos a un prospecto antes de capturar el SFV).
 *
 * Cuando hay datos, `AppShell` monta `EncabezadoContextual` arriba
 * (única ruta sin HeaderDossier propio, FIX G del PR #16).
 */
export function BESS() {
  const { datos } = useDatosSFV();

  return (
    <div className="mx-auto max-w-[1080px] px-10 pb-16 pt-8">
      <PageHeader hayDatos={!!datos} />
      <TabBessCatalogo />
    </div>
  );
}
