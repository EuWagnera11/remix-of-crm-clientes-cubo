import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, GitBranch, FileText, Package, Settings,
  ChevronLeft, ChevronRight, Search, MessageSquare, Calendar,
  DollarSign, BarChart3, ChevronDown, Star, Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NotificationsDropdown from "@/components/NotificationsDropdown";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pacientes / Leads", url: "/patients", icon: Users },
  {
    title: "Pipeline", icon: GitBranch,
    children: [
      { title: "Pacientes", url: "/pipeline/patients" },
      { title: "Orcamentos", url: "/pipeline/budgets" },
    ],
  },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageSquare, badge: 3 },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
  { title: "Orcamentos", url: "/budgets", icon: FileText },
  { title: "Procedimentos", url: "/procedures", icon: Package },
  { title: "Automacoes", url: "/automations", icon: Zap },
  { title: "Relatorios", url: "/reports", icon: BarChart3 },
  { title: "NPS", url: "/nps", icon: Star },
  { title: "Configuracoes", url: "/settings", icon: Settings },
];

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Pacientes / Leads",
  "/pipeline/patients": "Pipeline > Pacientes",
  "/pipeline/budgets": "Pipeline > Orcamentos",
  "/budgets": "Orcamentos",
  "/procedures": "Procedimentos",
  "/settings": "Configuracoes",
  "/whatsapp": "WhatsApp",
  "/agenda": "Agenda",
  "/automations": "Automacoes",
  "/financial": "Financeiro",
  "/reports": "Relatorios",
  "/nps": "NPS e Satisfacao",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;
  const breadcrumb = breadcrumbMap[currentPath] || currentPath.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" > ");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={cn("flex flex-col border-r border-border bg-card transition-all duration-200", collapsed ? "w-16" : "w-60")}>
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-lg font-bold tracking-tight">CUBO CRM</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.title}>
                    <button onClick={() => setPipelineOpen(!pipelineOpen)}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", collapsed && "justify-center px-2")}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (<><span className="flex-1 text-left">{item.title}</span><ChevronDown className={cn("h-3 w-3 transition-transform", pipelineOpen && "rotate-180")} /></>)}
                    </button>
                    {!collapsed && pipelineOpen && (
                      <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                        {item.children.map((child) => (
                          <NavLink key={child.url} to={child.url} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" activeClassName="bg-accent text-foreground border-l-2 border-primary">{child.title}</NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = currentPath === item.url || (item.url !== "/dashboard" && currentPath.startsWith(item.url + "/"));

              return (
                <NavLink key={item.url} to={item.url!}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", collapsed && "justify-center px-2")}
                  activeClassName="bg-accent text-foreground border-l-2 border-primary" title={collapsed ? item.title : undefined}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <><span className="flex-1">{item.title}</span>
                      {item.badge && (<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">{item.badge}</span>)}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Admin Link */}
        {!collapsed && (
          <div className="border-t border-border px-3 py-2">
            <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <LayoutDashboard className="h-3 w-3" />Painel Admin CUBO
            </Link>
          </div>
        )}

        {!collapsed && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground/40">Estrutura // Velocidade // Lucro Real.</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <span className="text-sm text-muted-foreground">{breadcrumb}</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="h-9 w-56 bg-background pl-9 text-sm" />
            </div>
            <NotificationsDropdown />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">DR</div>
              <span className="text-sm font-medium">Dr. Admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
