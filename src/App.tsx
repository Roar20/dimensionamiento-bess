import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { Home } from "@/pages/Home";

export function App() {
  return (
    <ViewModeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ViewModeProvider>
  );
}
