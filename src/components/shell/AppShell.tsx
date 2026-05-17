import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-page text-ink-secondary">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
