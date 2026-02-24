import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Building2, DollarSign, TrendingDown, Star, AlertTriangle,
  Search, Eye, MoreHorizontal, ChevronRight, Users, BarChart3,
  CreditCard, Settings, LayoutDashboard, ChevronLeft,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock Admin Data
const clinicsOverTime = [
  { month: "Set", active: 42 }, { month: "Out", active: 45 }, { month: "Nov", active: 48 },
  { month: "Dez", active: 52 }, { month: "Jan", active: 55 }, { month: "Fev", active: 58 },
];

const mrrOverTime = [
  { month: "Set", mrr: 63000 }, { month: "Out", mrr: 67500 }, { month: "Nov", mrr: 72000 },
  { month: "Dez", mrr: 78000 }, { month: "Jan", mrr: 82500 }, { month: "Fev", mrr: 87000 },
];

const clinicsByPlan = [
  { name: "Start", value: 22, color: "#3B82F6" },
  { name: "Pro", value: 24, color: "#A855F7" },
  { name: "Elite", value: 12, color: "#FF6B00" },
];

const topClinics = [
  { name: "Clinica Estetica SP", leads: 340, msgs: 2100, agendamentos: 180 },
  { name: "OdontoVida", leads: 280, msgs: 1800, agendamentos: 150 },
  { name: "Derma Center", leads: 220, msgs: 1500, agendamentos: 120 },
  { name: "HOF Premium", leads: 200, msgs: 1200, agendamentos: 110 },
  { name: "Clinica Bela Face", leads: 180, msgs: 1100, agendamentos: 95 },
];

interface Clinic {
  id: string; name: string; plan: "Start" | "Pro" | "Elite"; status: "ativa" | "inadimplente" | "cancelada" | "trial";
  subscription_date: string; monthly_value: number; leads: number; appointments: number; revenue: number;
  cnpj?: string; city: string; owner: string;
}

const mockClinics: Clinic[] = [
  { id: "1", name: "Clinica Estetica SP", plan: "Elite", status: "ativa", subscription_date: "2025-03-15", monthly_value: 2500, leads: 340, appointments: 180, revenue: 245000, city: "Sao Paulo", owner: "Dr. Carlos" },
  { id: "2", name: "OdontoVida", plan: "Pro", status: "ativa", subscription_date: "2025-05-01", monthly_value: 1500, leads: 280, appointments: 150, revenue: 185000, city: "Rio de Janeiro", owner: "Dra. Fernanda" },
  { id: "3", name: "Derma Center", plan: "Pro", status: "ativa", subscription_date: "2025-06-20", monthly_value: 1500, leads: 220, appointments: 120, revenue: 142000, city: "Belo Horizonte", owner: "Dr. Marcos" },
  { id: "4", name: "HOF Premium", plan: "Elite", status: "inadimplente", subscription_date: "2025-04-10", monthly_value: 2500, leads: 200, appointments: 110, revenue: 198000, city: "Curitiba", owner: "Dra. Paula" },
  { id: "5", name: "Clinica Bela Face", plan: "Start", status: "ativa", subscription_date: "2025-08-01", monthly_value: 500, leads: 180, appointments: 95, revenue: 78000, city: "Brasilia", owner: "Dra. Ana" },
  { id: "6", name: "Sorriso Perfeito", plan: "Start", status: "trial", subscription_date: "2026-02-01", monthly_value: 500, leads: 15, appointments: 8, revenue: 3200, city: "Salvador", owner: "Dr. Pedro" },
  { id: "7", name: "Corpo e Mente", plan: "Pro", status: "cancelada", subscription_date: "2025-07-15", monthly_value: 1500, leads: 45, appointments: 20, revenue: 12000, city: "Recife", owner: "Dra. Lucia" },
];

const PLAN_COLORS = { Start: "bg-info/10 text-info border-info/20", Pro: "bg-purple-500/10 text-purple-400 border-purple-500/20", Elite: "bg-primary/10 text-primary border-primary/20" };
const STATUS_COLORS = { ativa: "bg-success/10 text-success border-success/20", inadimplente: "bg-destructive/10 text-destructive border-destructive/20", cancelada: "bg-muted text-muted-foreground border-border", trial: "bg-warning/10 text-warning border-warning/20" };

const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clinics" | "billing" | "metrics">("dashboard");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const activeClinics = mockClinics.filter(c => c.status === "ativa" || c.status === "trial").length;
  const mrr = mockClinics.filter(c => c.status === "ativa").reduce((s, c) => s + c.monthly_value, 0);
  const churn = mockClinics.filter(c => c.status === "cancelada").length;
  const overdue = mockClinics.filter(c => c.status === "inadimplente").length;

  const filteredClinics = mockClinics.filter(c => {
    if (planFilter !== "all" && c.plan !== planFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adminNavItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "clinics" as const, label: "Clinicas", icon: Building2 },
    { id: "billing" as const, label: "Planos e Billing", icon: CreditCard },
    { id: "metrics" as const, label: "Metricas de Uso", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-center gap-4 bg-primary text-sm font-medium text-primary-foreground">
          Voce esta visualizando como: {impersonating}
          <Button size="sm" variant="secondary" className="h-6 text-xs" onClick={() => setImpersonating(null)}>Sair</Button>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <div><span className="text-lg font-bold tracking-tight">CUBO</span><span className="ml-1 text-xs text-muted-foreground">Admin</span></div>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-3">
          <div className="flex flex-col gap-0.5">{adminNavItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", activeTab === item.id ? "bg-accent text-foreground border-l-2 border-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <item.icon className="h-4 w-4" /><span>{item.label}</span>
            </button>
          ))}</div>
        </nav>
        <div className="border-t border-border px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3 w-3" />Voltar ao CRM
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <span className="text-sm text-muted-foreground">Admin / {adminNavItems.find(i => i.id === activeTab)?.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">PA</div>
            <span className="text-sm font-medium">Platform Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Painel Administrativo CUBO</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Clinicas Ativas</p><p className="text-2xl font-bold">{activeClinics}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold text-success">{formatBRL(mrr)}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Churn Mes</p><p className="text-2xl font-bold text-destructive">{churn}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">NPS Produto</p><p className="text-2xl font-bold text-success">72</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Inadimplentes</p><p className="text-2xl font-bold text-destructive">{overdue}</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-sm">Clinicas Ativas</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={220}><LineChart data={clinicsOverTime}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="active" stroke="#22C55E" strokeWidth={2} />
                  </LineChart></ResponsiveContainer>
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">MRR</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={220}><LineChart data={mrrOverTime}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart></ResponsiveContainer>
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Clinicas por Plano</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={clinicsByPlan} dataKey="value" innerRadius={50} outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                    {clinicsByPlan.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} /></PieChart></ResponsiveContainer>
                </CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle className="text-sm">Top 5 Clinicas por Uso</CardTitle></CardHeader><CardContent>
                <div className="overflow-x-auto"><table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-3 font-medium">Clinica</th><th className="pb-3 font-medium">Leads</th><th className="pb-3 font-medium">Mensagens</th><th className="pb-3 font-medium">Agendamentos</th></tr></thead>
                  <tbody>{topClinics.map((c, i) => (
                    <tr key={i} className="border-b border-border/50"><td className="py-3 font-medium">{c.name}</td><td className="py-3">{c.leads}</td><td className="py-3">{c.msgs}</td><td className="py-3">{c.agendamentos}</td></tr>
                  ))}</tbody>
                </table></div>
              </CardContent></Card>
            </div>
          )}

          {/* CLINICS */}
          {activeTab === "clinics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestao de Clinicas</h1>
                <Button>Nova Clinica</Button>
              </div>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="h-9 w-64 bg-background pl-9 text-sm" placeholder="Buscar clinica..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <Select value={planFilter} onValueChange={setPlanFilter}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Start">Start</SelectItem><SelectItem value="Pro">Pro</SelectItem><SelectItem value="Elite">Elite</SelectItem></SelectContent>
                </Select>
              </div>
              <Card><CardContent className="pt-6"><div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Clinica</th><th className="pb-3 font-medium">Plano</th><th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Cidade</th><th className="pb-3 font-medium">Valor</th><th className="pb-3 font-medium">Leads</th><th className="pb-3 font-medium">Acoes</th>
                </tr></thead>
                <tbody>{filteredClinics.map(c => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3"><div><span className="font-medium">{c.name}</span><p className="text-xs text-muted-foreground">{c.owner}</p></div></td>
                    <td className="py-3"><Badge variant="outline" className={PLAN_COLORS[c.plan]}>{c.plan}</Badge></td>
                    <td className="py-3"><Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status}</Badge></td>
                    <td className="py-3 text-muted-foreground">{c.city}</td>
                    <td className="py-3">{formatBRL(c.monthly_value)}/mes</td>
                    <td className="py-3">{c.leads}</td>
                    <td className="py-3"><div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setImpersonating(c.name)}><Eye className="mr-1 h-3 w-3" />Acessar</Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div></CardContent></Card>
            </div>
          )}

          {/* BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Planos e Billing</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { name: "Start", price: "R$ 500/mes", features: ["Ate 200 leads", "1 profissional", "WhatsApp basico"], clinics: 22 },
                  { name: "Pro", price: "R$ 1.500/mes", features: ["Leads ilimitados", "Ate 5 profissionais", "Automacoes", "Relatorios"], clinics: 24 },
                  { name: "Elite", price: "R$ 2.500/mes", features: ["Tudo do Pro", "Profissionais ilimitados", "API", "Suporte prioritario"], clinics: 12 },
                ].map(plan => (
                  <Card key={plan.name} className={plan.name === "Elite" ? "border-primary" : ""}>
                    <CardHeader><CardTitle>{plan.name}</CardTitle><p className="text-2xl font-bold text-primary">{plan.price}</p></CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">{plan.features.map(f => <li key={f} className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" />{f}</li>)}</ul>
                      <p className="mt-4 text-sm font-medium">{plan.clinics} clinicas ativas</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* METRICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Metricas de Uso</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-2xl font-bold">4.280</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Msgs WhatsApp</p><p className="text-2xl font-bold">28.500</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Agendamentos</p><p className="text-2xl font-bold">3.120</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Orcamentos</p><p className="text-2xl font-bold">1.850</p></CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle className="text-sm">Clinicas com Baixo Uso (Risco de Churn)</CardTitle></CardHeader><CardContent>
                <div className="space-y-2">
                  {mockClinics.filter(c => c.leads < 50).map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div><span className="font-medium text-sm">{c.name}</span><p className="text-xs text-muted-foreground">{c.leads} leads · {c.appointments} agendamentos</p></div>
                      <Badge variant="outline" className="border-destructive/20 text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />Risco</Badge>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
