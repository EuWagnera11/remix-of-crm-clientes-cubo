import {
  Users, CalendarCheck, FileText, DollarSign, Percent, Clock, Building2,
  AlertTriangle, TrendingUp, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, isToday, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { clinicId } = useAuth();
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const prevMonthStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
  const prevMonthEnd = format(startOfMonth(now), "yyyy-MM-dd");

  const { data: patientsCount = 0 } = useQuery({
    queryKey: ["dashboard-patients", clinicId, monthStart],
    queryFn: async () => {
      if (!clinicId) return 0;
      const { count } = await supabase.from("patients").select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId).gte("created_at", monthStart);
      return count || 0;
    },
    enabled: !!clinicId,
  });

  const { data: prevPatientsCount = 0 } = useQuery({
    queryKey: ["dashboard-patients-prev", clinicId],
    queryFn: async () => {
      if (!clinicId) return 0;
      const { count } = await supabase.from("patients").select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId).gte("created_at", prevMonthStart).lt("created_at", prevMonthEnd);
      return count || 0;
    },
    enabled: !!clinicId,
  });

  const { data: appointmentsCount = 0 } = useQuery({
    queryKey: ["dashboard-appointments", clinicId, monthStart],
    queryFn: async () => {
      if (!clinicId) return 0;
      const { count } = await supabase.from("appointments").select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId).gte("date", monthStart);
      return count || 0;
    },
    enabled: !!clinicId,
  });

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ["dashboard-today-appointments", clinicId, todayStr],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("appointments").select("*, patients(name), procedures(name)")
        .eq("clinic_id", clinicId).eq("date", todayStr).order("time");
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: budgetsData } = useQuery({
    queryKey: ["dashboard-budgets", clinicId, monthStart],
    queryFn: async () => {
      if (!clinicId) return { count: 0, total: 0, approved: 0 };
      const { data } = await supabase.from("budgets").select("id, total, status")
        .eq("clinic_id", clinicId).gte("created_at", monthStart);
      const items = data || [];
      const approved = items.filter(b => b.status === "aprovado");
      const total = approved.reduce((sum, b) => sum + Number(b.total || 0), 0);
      return { count: items.length, total, approved: approved.length };
    },
    enabled: !!clinicId,
  });

  const { data: overdueInstallments = [] } = useQuery({
    queryKey: ["dashboard-overdue", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("financial_installments")
        .select("*, patients(name)")
        .eq("clinic_id", clinicId)
        .eq("status", "pendente")
        .lt("due_date", todayStr)
        .order("due_date")
        .limit(5);
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: pendingLeads = [] } = useQuery({
    queryKey: ["dashboard-pending-leads", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("patients")
        .select("id, name, created_at, phone")
        .eq("clinic_id", clinicId)
        .eq("stage", "lead")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!clinicId,
  });

  const conversionRate = budgetsData && budgetsData.count > 0
    ? Math.round((budgetsData.approved / budgetsData.count) * 100) : 0;

  const leadsTrend = prevPatientsCount > 0
    ? `${patientsCount >= prevPatientsCount ? "+" : ""}${Math.round(((patientsCount - prevPatientsCount) / prevPatientsCount) * 100)}% vs mês anterior`
    : undefined;

  const hasData = clinicId && (patientsCount > 0 || appointmentsCount > 0 || (budgetsData?.count || 0) > 0);

  const STATUS_COLORS: Record<string, string> = {
    agendado: "bg-blue-500/10 text-blue-500",
    confirmado: "bg-green-500/10 text-green-500",
    realizado: "bg-emerald-500/10 text-emerald-500",
    cancelado: "bg-destructive/10 text-destructive",
    "no-show": "bg-yellow-500/10 text-yellow-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral da sua clínica</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Leads este mês" value={clinicId ? String(patientsCount) : "—"} icon={Users} trend={leadsTrend} />
        <StatCard title="Agendamentos" value={clinicId ? String(appointmentsCount) : "—"} icon={CalendarCheck} />
        <StatCard title="Orçamentos" value={clinicId ? String(budgetsData?.count || 0) : "—"} icon={FileText} />
        <StatCard title="Faturamento" value={clinicId ? `R$ ${(budgetsData?.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"} icon={DollarSign} />
        <StatCard title="Conversão" value={clinicId ? `${conversionRate}%` : "—"} icon={Percent} />
        <StatCard title="Hoje" value={clinicId ? `${todayAppointments.length} consultas` : "—"} icon={Clock} />
      </div>

      {!hasData && (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {clinicId ? "Nenhum dado disponível ainda" : "Selecione uma clínica pelo painel admin"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {clinicId ? "Os dados aparecerão aqui conforme leads, agendamentos e orçamentos forem registrados." : "Acesse uma clínica para ver os dados do CRM."}
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Appointments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Agendamentos de Hoje</CardTitle>
                <Link to="/agenda"><Button variant="ghost" size="sm" className="h-7 text-xs gap-1">Ver agenda <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhum agendamento hoje</p>
              ) : (
                <div className="space-y-2">
                  {todayAppointments.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">{a.time?.slice(0, 5)}</span>
                        <div>
                          <p className="text-sm font-medium">{a.patients?.name}</p>
                          <p className="text-xs text-muted-foreground">{a.procedures?.name || "Consulta"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={STATUS_COLORS[a.status || "agendado"]}>{a.status || "agendado"}</Badge>
                    </div>
                  ))}
                  {todayAppointments.length > 5 && (
                    <p className="text-center text-xs text-muted-foreground">+{todayAppointments.length - 5} mais</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Installments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {overdueInstallments.length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  Parcelas Vencidas
                </CardTitle>
                <Link to="/financial"><Button variant="ghost" size="sm" className="h-7 text-xs gap-1">Financeiro <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {overdueInstallments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma parcela vencida 🎉</p>
              ) : (
                <div className="space-y-2">
                  {overdueInstallments.map((inst: any) => (
                    <div key={inst.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div>
                        <p className="text-sm font-medium">{inst.patients?.name}</p>
                        <p className="text-xs text-muted-foreground">Venceu em {format(new Date(inst.due_date), "dd/MM")}</p>
                      </div>
                      <span className="text-sm font-semibold text-destructive">
                        R$ {Number(inst.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Leads */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Leads Recentes</CardTitle>
                <Link to="/patients"><Button variant="ghost" size="sm" className="h-7 text-xs gap-1">Ver todos <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingLeads.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhum lead pendente</p>
              ) : (
                <div className="space-y-2">
                  {pendingLeads.map((lead: any) => (
                    <Link key={lead.id} to={`/patients/${lead.id}`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone || "Sem telefone"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(lead.created_at), "dd/MM", { locale: ptBR })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
