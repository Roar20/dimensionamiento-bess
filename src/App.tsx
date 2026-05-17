import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { BESS } from "@/pages/BESS";
import { Home } from "@/pages/Home";
import { SFV } from "@/pages/SFV";

export function App() {
  return (
    <ViewModeProvider>
      <DatosSFVProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sfv" element={<SFV />} />
              <Route path="/bess" element={<BESS />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </DatosSFVProvider>
    </ViewModeProvider>
  );
}
