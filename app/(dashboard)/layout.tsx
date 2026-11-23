"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Marca, Sidebar } from "@/components/Sidebar";
import { hasValidAuthentication } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!hasValidAuthentication()) {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar aberto={menuAberto} onFechar={() => setMenuAberto(false)} />

      <div className="app-topbar sticky top-0 z-20 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Marca />
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="flex h-11 items-center gap-2 rounded-lg border border-sidebar-border px-4 text-base font-medium text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          Menu
        </button>
      </div>

      <div className="app-content lg:pl-[18rem]">
        <div className="min-h-screen w-full">{children}</div>
      </div>
    </div>
  );
}
