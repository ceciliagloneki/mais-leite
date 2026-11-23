"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";

import { Logo } from "@/components/Logo";
import { NAV_GROUPS } from "@/lib/navigation";
import { clearAuthentication, getAuthenticatedEmployee } from "@/lib/auth";

interface SidebarProps {
  aberto: boolean;
  onFechar: () => void;
}

export function Marca({ claro = true }: { claro?: boolean }) {
  return <Logo claro={claro} tamanho="sm" slogan={false} />;
}

export function Sidebar({ aberto, onFechar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const funcionario = getAuthenticatedEmployee();

  function logout() {
    clearAuthentication();
    router.replace("/login");
  }

  return (
    <>
      {aberto ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onFechar} aria-hidden="true" /> : null}

      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[18rem] flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-sidebar-border px-5 py-4">
          <div>
            <Marca />
            <p className="mt-1 text-xs leading-snug text-sidebar-muted">Banco de Leite Humano de Marília</p>
          </div>
          <button type="button" onClick={onFechar} className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label="Fechar menu">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Menu principal">
          {NAV_GROUPS.map((grupo, indice) => (
            <div key={grupo.titulo ?? indice} className="mb-3">
              {grupo.titulo ? <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">{grupo.titulo}</p> : null}
              <ul className="flex flex-col gap-0.5">
                {grupo.itens.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onFechar}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                            : "text-sidebar-foreground/85 hover:bg-white/10 hover:text-sidebar-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="mb-2 px-1 leading-tight">
            <p className="text-sm font-medium">{funcionario?.nome ?? "Funcionário"}</p>
            <p className="text-xs text-sidebar-muted">{funcionario?.cargo ?? "Acesso ao sistema"}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg border border-sidebar-border px-3 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sair do sistema
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
