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

// No MRR or plans - CRM is included in marketing agency plan

const topClinics = [
  { name: "Clinica Estetica SP", leads: 340, msgs: 2100, agendamentos: 180 },
  { name: "OdontoVida", leads: 280, msgs: 1800, agendamentos: 150 },
  { name: "Derma Center", leads: 220, msgs: 1500, agendamentos: 120 },
  { name: "HOF Premium", leads: 200, msgs: 1200, agendamentos: 110 },
  { name: "Clinica Bela Face", leads: 180, msgs: 1100, agendamentos: 95 },
];

interface Clinic {
  id: string; name: string; status: "ativa" | "inativa" | "cancelada";
  leads: number; appointments: number; revenue: number;
  city: string; owner: string;
}

const mockClinics: Clinic[] = [
  { id: "1", name: "Clinica Estetica SP", status: "ativa", leads: 340, appointments: 180, revenue: 245000, city: "Sao Paulo", owner: "Dr. Carlos" },
  { id: "2", name: "OdontoVida", status: "ativa", leads: 280, appointments: 150, revenue: 185000, city: "Rio de Janeiro", owner: "Dra. Fernanda" },
  { id: "3", name: "Derma Center", status: "ativa", leads: 220, appointments: 120, revenue: 142000, city: "Belo Horizonte", owner: "Dr. Marcos" },
  { id: "4", name: "HOF Premium", status: "ativa", leads: 200, appointments: 110, revenue: 198000, city: "Curitiba", owner: "Dra. Paula" },
  { id: "5", name: "Clinica Bela Face", status: "ativa", leads: 180, appointments: 95, revenue: 78000, city: "Brasilia", owner: "Dra. Ana" },
  { id: "6", name: "Sorriso Perfeito", status: "inativa", leads: 15, appointments: 8, revenue: 3200, city: "Salvador", owner: "Dr. Pedro" },
  { id: "7", name: "Corpo e Mente", status: "cancelada", leads: 45, appointments: 20, revenue: 12000, city: "Recife", owner: "Dra. Lucia" },
];

const STATUS_COLORS = { ativa: "bg-success/10 text-success border-success/20", inativa: "bg-muted text-muted-foreground border-border", cancelada: "bg-destructive/10 text-destructive border-destructive/20" };

const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clinics" | "metrics">("dashboard");
  const [search, setSearch] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const activeClinics = mockClinics.filter(c => c.status === "ativa").length;
  const totalClinics = mockClinics.length;
  const canceladas = mockClinics.filter(c => c.status === "cancelada").length;

  const filteredClinics = mockClinics.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adminNavItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "clinics" as const, label: "Clinicas", icon: Building2 },
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Clinicas Ativas</p><p className="text-2xl font-bold">{activeClinics}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Clinicas</p><p className="text-2xl font-bold">{totalClinics}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Canceladas</p><p className="text-2xl font-bold text-destructive">{canceladas}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">NPS Produto</p><p className="text-2xl font-bold text-success">72</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-sm">Clinicas Ativas</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={220}><LineChart data={clinicsOverTime}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="active" stroke="#22C55E" strokeWidth={2} />
                  </LineChart></ResponsiveContainer>
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Top 5 Clinicas por Uso</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={220}><BarChart data={topClinics}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart></ResponsiveContainer>
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
              </div>
              <Card><CardContent className="pt-6"><div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Clinica</th><th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Cidade</th><th className="pb-3 font-medium">Leads</th><th className="pb-3 font-medium">Agendamentos</th><th className="pb-3 font-medium">Acoes</th>
                </tr></thead>
                <tbody>{filteredClinics.map(c => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3"><div><span className="font-medium">{c.name}</span><p className="text-xs text-muted-foreground">{c.owner}</p></div></td>
                    <td className="py-3"><Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status}</Badge></td>
                    <td className="py-3 text-muted-foreground">{c.city}</td>
                    <td className="py-3">{c.leads}</td>
                    <td className="py-3">{c.appointments}</td>
                    <td className="py-3"><div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setImpersonating(c.name)}><Eye className="mr-1 h-3 w-3" />Acessar</Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div></CardContent></Card>
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
