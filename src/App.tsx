import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { DatosSFVProvider } from "@/hooks/useDatosSFV";
import { BESS } from "@/pages/BESS";
import { Financiero } from "@/pages/Financiero";
import { Home } from "@/pages/Home";
import { SFV } from "@/pages/SFV";
import { SFVBess } from "@/pages/SFVBess";

export function App() {
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
          </Routes>
        </AppShell>
      </BrowserRouter>
    </DatosSFVProvider>
  );
}
