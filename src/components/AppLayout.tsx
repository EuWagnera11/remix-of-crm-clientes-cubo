import { useState, useEffect, useRef } from "react";
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
import ThemeToggle from "@/components/ThemeToggle";
import { useWhiteLabel } from "@/contexts/WhiteLabelContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  { title: "WhatsApp", url: "/whatsapp", icon: MessageSquare },
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
  "/pipeline/patients": "Pipeline / Pacientes",
  "/pipeline/budgets": "Pipeline / Orcamentos",
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
  const breadcrumb = breadcrumbMap[currentPath] || currentPath.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");
  const { settings } = useWhiteLabel();
  const { user, roles, isPlatformAdmin, clinicId, impersonatedClinicId, clearImpersonation, signOut } = useAuth();
  const queryClient = useQueryClient();
  const prevClinicIdRef = useRef<string | null>(clinicId ?? null);
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userRole = roles[0]?.role;

  // Clear React Query cache when clinic context changes
  useEffect(() => {
    if (clinicId !== prevClinicIdRef.current && clinicId !== null) {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'impersonated-clinic' });
      prevClinicIdRef.current = clinicId;
    }
  }, [clinicId, queryClient]);

  // Fetch impersonated clinic name
  const { data: impersonatedClinic } = useQuery({
    queryKey: ["impersonated-clinic", impersonatedClinicId],
    queryFn: async () => {
      if (!impersonatedClinicId) return null;
      const { data } = await supabase.from("clinics").select("name").eq("id", impersonatedClinicId).single();
      return data;
    },
    enabled: !!impersonatedClinicId,
  });

  const ImpersonationBanner = () => (
    <div className="flex h-10 items-center justify-center gap-4 bg-primary text-sm font-medium text-primary-foreground">
      <Eye className="h-4 w-4" />
      Visualizando como: {impersonatedClinic?.name || "Clínica"}
      <Button size="sm" variant="secondary" className="h-6 text-xs" onClick={() => clearImpersonation()}>
        Sair da visualização
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border/60 bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-primary-foreground">{settings.clinicName.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight">{settings.clinicName}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{settings.clinicSubtitle}</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="mx-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-primary-foreground">{settings.clinicName.charAt(0)}</span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-border/50" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => setPipelineOpen(!pipelineOpen)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", pipelineOpen && "rotate-180")} />
                        </>
                      )}
                    </button>
                    {!collapsed && pipelineOpen && (
                      <div className="ml-8 mt-1 flex flex-col gap-0.5 border-l border-border/50 pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.url}
                            to={child.url}
                            className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground"
                            activeClassName="text-primary font-medium bg-primary/5"
                          >
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.url}
                  to={item.url!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  activeClassName="bg-primary/8 text-foreground border-l-2 border-primary -ml-px"
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Admin Link - only for platform_admin */}
        {!collapsed && isPlatformAdmin && (
          <>
            <div className="mx-4 h-px bg-border/50" />
            <div className="px-3 py-2">
              <Link
                to="/admin"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-muted-foreground/70 transition-all hover:bg-accent/60 hover:text-foreground"
              >
                <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.8} />
                Painel Admin CUBO
              </Link>
            </div>
          </>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30 font-medium">
              Estrutura / Velocidade / Lucro
            </p>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className={cn("border-t border-border/50 px-3 py-3", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Impersonation Banner */}
        {isPlatformAdmin && impersonatedClinicId && (
          <ImpersonationBanner />
        )}
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/50 backdrop-blur-sm px-8">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground font-medium">{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Buscar..."
                className="h-9 w-60 rounded-lg border-border/60 bg-background/60 pl-9 text-[13px] placeholder:text-muted-foreground/40 focus:bg-background"
              />
            </div>
            <ThemeToggle />
            <NotificationsDropdown />
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium leading-tight">{user?.email?.split('@')[0]}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{userRole?.replace('_', ' ') || 'Usuário'}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={signOut} title="Sair">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
