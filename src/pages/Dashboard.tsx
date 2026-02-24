import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarCheck,
  FileText,
  DollarSign,
  Percent,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardData } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(24, 95%, 53%)", "#3B82F6", "#22C55E", "#A855F7", "#F59E0B", "#6B7280"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const chartTooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  color: "hsl(var(--foreground))",
  fontSize: 12,
  boxShadow: "0 4px 16px hsl(var(--foreground) / 0.06)",
};

function StatCard({
  title, value, subtitle, icon: Icon, trend,
}: {
  title: string; value: string; subtitle?: string; icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
                {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.value}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const d = dashboardData;
  const leadsGrowth = Math.round(((d.leadsThisMonth - d.leadsLastMonth) / d.leadsLastMonth) * 100);

  const alerts = [
    { text: "3 leads sem contato ha mais de 24h", urgent: true },
    { text: "2 agendamentos de hoje nao confirmados", urgent: true },
    { text: "1 orcamento vence em 3 dias", urgent: false },
    { text: "2 parcelas atrasadas", urgent: true },
  ];

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
        <StatCard title="Leads este mes" value={String(d.leadsThisMonth)} icon={Users} trend={{ value: leadsGrowth, positive: leadsGrowth > 0 }} />
        <StatCard title="Agendamentos" value={String(d.appointmentsThisWeek)} subtitle={`${d.appointmentsConfirmed} confirmados`} icon={CalendarCheck} />
        <StatCard title="Orcamentos" value={formatCurrency(d.pendingBudgets)} icon={FileText} />
        <StatCard title="Faturamento" value={formatCurrency(d.revenueThisMonth)} icon={DollarSign} trend={{ value: 8, positive: true }} />
        <StatCard title="Conversao" value={`${d.conversionRate}%`} icon={Percent} />
        <StatCard title="Resp. media" value={`${d.avgResponseTime}min`} icon={Clock} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Leads por Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.weeklyLeads} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "hsl(var(--accent) / 0.5)" }} />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Leads por Origem</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={d.leadsByOrigin} dataKey="value" nameKey="origin" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} label={({ origin, percent }) => `${origin} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {d.leadsByOrigin.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={d.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Top Procedimentos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.topProcedures} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--primary) / 0.75)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Loss + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Funil de Conversao</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {d.funnel.map((step, i) => (
                <div key={step.stage} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium">{step.stage}</span>
                    <span className="text-muted-foreground">{step.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${step.value}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Motivos de Perda</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={d.lossReasons} dataKey="value" nameKey="reason" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} fontSize={10} label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}>
                  {d.lossReasons.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Alertas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-accent/30 p-3 transition-colors hover:bg-accent/60">
                  <AlertCircle className={`h-4 w-4 shrink-0 ${alert.urgent ? "text-destructive" : "text-warning"}`} strokeWidth={1.8} />
                  <p className="flex-1 text-[12px] leading-relaxed">{alert.text}</p>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
