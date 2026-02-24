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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardData, mockPatients } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3B82F6", "#EC4899", "#22C55E", "#F59E0B", "#A855F7", "#6B7280"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend.positive ? "text-success" : "text-destructive"}`}>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Leads este mes" value={String(d.leadsThisMonth)} icon={Users} trend={{ value: leadsGrowth, positive: leadsGrowth > 0 }} />
        <StatCard title="Agendamentos semana" value={String(d.appointmentsThisWeek)} subtitle={`${d.appointmentsConfirmed} confirmados`} icon={CalendarCheck} />
        <StatCard title="Orcamentos pendentes" value={formatCurrency(d.pendingBudgets)} icon={FileText} />
        <StatCard title="Faturamento do mes" value={formatCurrency(d.revenueThisMonth)} icon={DollarSign} trend={{ value: 8, positive: true }} />
        <StatCard title="Taxa de conversao" value={`${d.conversionRate}%`} icon={Percent} />
        <StatCard title="Tempo resp. medio" value={`${d.avgResponseTime}min`} icon={Clock} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Leads por Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={d.weeklyLeads}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Leads por Origem</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={d.leadsByOrigin} dataKey="value" nameKey="origin" cx="50%" cy="50%" outerRadius={90} label={({ origin, percent }) => `${origin} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {d.leadsByOrigin.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={d.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Procedimentos Mais Vendidos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={d.topProcedures} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" fill="#A855F7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Loss + Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Funnel */}
        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Funil de Conversao</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {d.funnel.map((step, i) => (
                <div key={step.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{step.stage}</span>
                    <span className="text-muted-foreground">{step.value}%</span>
                  </div>
                  <div className="h-6 w-full overflow-hidden rounded bg-accent">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${step.value}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loss reasons */}
        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Motivos de Perda</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={d.lossReasons} dataKey="value" nameKey="reason" cx="50%" cy="50%" innerRadius={40} outerRadius={70} fontSize={11} label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}>
                  {d.lossReasons.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-card">
          <CardHeader><CardTitle className="text-sm font-medium">Alertas e Pendencias</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${alert.urgent ? "text-destructive" : "text-warning"}`} />
                  <p className="text-sm">{alert.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
