import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { BESS } from "@/pages/BESS";
import { Financiero } from "@/pages/Financiero";
import { Home } from "@/pages/Home";
import { ResumenEjecutivo } from "@/pages/ResumenEjecutivo";
import { SFV } from "@/pages/SFV";
import { SFVBess } from "@/pages/SFVBess";

const MIGRACION_KEY = "dimensionamiento-bess:migracion-stateless-v1";
const CLAVES_OBSOLETAS: readonly string[] = [
  "dimensionamiento-bess:datos-sfv",
  "dimensionamiento-bess:configuracion-bess",
  "dimensionamiento-bess:parametros-ppa",
  "dimensionamiento-bess:periodo-activo",
  "dimensionamiento-bess:parametros-financieros",
  "dimensionamiento-bess:precios-proxy",
  "dimensionamiento-bess:viewMode",
];

/**
 * Limpieza one-shot post-migración a modo stateless. Borra las claves
 * de análisis que persistían en versiones previas y deja un marcador
 * idempotente. NO toca `dimensionamiento-bess:tipo-cambio`, que sigue
 * siendo preferencia del usuario (macro, no atada a la planta).
 */
function migrarStatelessV1() {
  try {
    if (window.localStorage.getItem(MIGRACION_KEY) === "done") return;
    for (const k of CLAVES_OBSOLETAS) {
      window.localStorage.removeItem(k);
    }
    window.localStorage.setItem(MIGRACION_KEY, "done");
  } catch {
    // localStorage no disponible (incógnito sandbox, etc.): noop.
  }
}

export function App() {
  useEffect(() => {
    migrarStatelessV1();
  }, []);

  return (
    <DatosSFVProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sfv" element={<SFV />} />
            <Route path="/bess" element={<BESS />} />
            <Route path="/sfv-bess" element={<SFVBess />} />
            <Route path="/financiero" element={<Financiero />} />
            <Route path="/resumen-ejecutivo" element={<ResumenEjecutivo />} />
            <Route path="/onboarding" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </DatosSFVProvider>
  );
}
