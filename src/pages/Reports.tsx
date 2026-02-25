import { useMemo } from "react";
import { BarChart3, Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(142 71% 45%)", "hsl(217 91% 60%)", "hsl(38 92% 50%)"];

export default function Reports() {
  const { clinicId } = useAuth();
  const now = new Date();

  // Last 6 months range
  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, "MMM", { locale: ptBR }) };
    });
  }, []);

  const { data: patients } = useQuery({
    queryKey: ["report-patients", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("patients").select("id, created_at, stage, source").eq("clinic_id", clinicId);
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: appointments } = useQuery({
    queryKey: ["report-appointments", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("appointments").select("id, date, status").eq("clinic_id", clinicId);
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: budgets } = useQuery({
    queryKey: ["report-budgets", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("budgets").select("id, created_at, status, total").eq("clinic_id", clinicId);
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: npsData } = useQuery({
    queryKey: ["report-nps", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase.from("nps_responses").select("id, score, created_at").eq("clinic_id", clinicId);
      return data || [];
    },
    enabled: !!clinicId,
  });

  // Monthly leads chart
  const leadsPerMonth = useMemo(() => {
    if (!patients) return [];
    return months.map(m => ({
      name: m.label,
      leads: patients.filter(p => {
        const d = new Date(p.created_at);
        return d >= m.start && d <= m.end;
      }).length,
    }));
  }, [patients, months]);

  // Revenue per month
  const revenuePerMonth = useMemo(() => {
    if (!budgets) return [];
    return months.map(m => ({
      name: m.label,
      faturamento: budgets
        .filter(b => b.status === "aprovado" && new Date(b.created_at) >= m.start && new Date(b.created_at) <= m.end)
        .reduce((sum, b) => sum + (b.total || 0), 0),
    }));
  }, [budgets, months]);

  // Budget status pie
  const budgetStatusPie = useMemo(() => {
    if (!budgets?.length) return [];
    const counts: Record<string, number> = {};
    budgets.forEach(b => { counts[b.status || "pendente"] = (counts[b.status || "pendente"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [budgets]);

  // Source pie
  const sourcePie = useMemo(() => {
    if (!patients?.length) return [];
    const counts: Record<string, number> = {};
    patients.forEach(p => { counts[p.source || "manual"] = (counts[p.source || "manual"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  // NPS average
  const npsAvg = useMemo(() => {
    if (!npsData?.length) return null;
    return (npsData.reduce((s, n) => s + n.score, 0) / npsData.length).toFixed(1);
  }, [npsData]);

  // Summary KPIs
  const totalLeads = patients?.length || 0;
  const totalAppointments = appointments?.length || 0;
  const totalRevenue = budgets?.filter(b => b.status === "aprovado").reduce((s, b) => s + (b.total || 0), 0) || 0;
  const conversionRate = patients?.length
    ? ((patients.filter(p => p.stage === "convertido").length / patients.length) * 100).toFixed(1)
    : "0";

  if (!clinicId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground">Selecione uma clínica para ver os relatórios.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Total Leads</p></div><p className="text-2xl font-bold">{totalLeads}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Agendamentos</p></div><p className="text-2xl font-bold">{totalAppointments}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Faturamento</p></div><p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR")}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Conversão</p></div><p className="text-2xl font-bold">{conversionRate}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">NPS Médio</p></div><p className="text-2xl font-bold">{npsAvg ?? "—"}</p></CardContent></Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Leads por Mês</CardTitle></CardHeader>
          <CardContent>
            {leadsPerMonth.some(l => l.leads > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={leadsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Sem dados de leads ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Faturamento por Mês</CardTitle></CardHeader>
          <CardContent>
            {revenuePerMonth.some(r => r.faturamento > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenuePerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Line type="monotone" dataKey="faturamento" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Sem dados de faturamento ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Status dos Orçamentos</CardTitle></CardHeader>
          <CardContent>
            {budgetStatusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={budgetStatusPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {budgetStatusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Sem orçamentos cadastrados.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Origem dos Leads</CardTitle></CardHeader>
          <CardContent>
            {sourcePie.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sourcePie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourcePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Sem leads cadastrados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
