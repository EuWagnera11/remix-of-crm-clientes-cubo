import {
  Users,
  CalendarCheck,
  FileText,
  DollarSign,
  Percent,
  Clock,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function StatCard({
  title, value, icon: Icon,
}: {
  title: string; value: string; icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
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
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const { data: patientsCount = 0 } = useQuery({
    queryKey: ["dashboard-patients", clinicId, startOfMonth],
    queryFn: async () => {
      if (!clinicId) return 0;
      const { count } = await supabase.from("patients").select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId).gte("created_at", startOfMonth);
      return count || 0;
    },
    enabled: !!clinicId,
  });

  const { data: appointmentsCount = 0 } = useQuery({
    queryKey: ["dashboard-appointments", clinicId, startOfMonth],
    queryFn: async () => {
      if (!clinicId) return 0;
      const { count } = await supabase.from("appointments").select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId).gte("date", startOfMonth);
      return count || 0;
    },
    enabled: !!clinicId,
  });

  const { data: budgetsData } = useQuery({
    queryKey: ["dashboard-budgets", clinicId, startOfMonth],
    queryFn: async () => {
      if (!clinicId) return { count: 0, total: 0, approved: 0 };
      const { data } = await supabase.from("budgets").select("id, total, status")
        .eq("clinic_id", clinicId).gte("created_at", startOfMonth);
      const items = data || [];
      const approved = items.filter(b => b.status === "aprovado");
      const total = approved.reduce((sum, b) => sum + Number(b.total || 0), 0);
      return { count: items.length, total, approved: approved.length };
    },
    enabled: !!clinicId,
  });

  const conversionRate = budgetsData && budgetsData.count > 0
    ? Math.round((budgetsData.approved / budgetsData.count) * 100)
    : 0;

  const hasData = clinicId && (patientsCount > 0 || appointmentsCount > 0 || (budgetsData?.count || 0) > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visao geral da sua clinica</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Leads este mes" value={clinicId ? String(patientsCount) : "—"} icon={Users} />
        <StatCard title="Agendamentos" value={clinicId ? String(appointmentsCount) : "—"} icon={CalendarCheck} />
        <StatCard title="Orcamentos" value={clinicId ? String(budgetsData?.count || 0) : "—"} icon={FileText} />
        <StatCard title="Faturamento" value={clinicId ? `R$ ${(budgetsData?.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"} icon={DollarSign} />
        <StatCard title="Conversao" value={clinicId ? `${conversionRate}%` : "—"} icon={Percent} />
        <StatCard title="Resp. media" value="—" icon={Clock} />
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
    </div>
  );
}
