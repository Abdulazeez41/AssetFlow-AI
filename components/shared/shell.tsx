import { ReactNode } from "react";
import { Nav } from "@/components/shared/nav";
import { PageTransition } from "@/components/shared/page-transition";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
