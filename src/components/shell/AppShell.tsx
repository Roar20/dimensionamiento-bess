import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
