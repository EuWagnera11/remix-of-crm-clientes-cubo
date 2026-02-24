import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, DollarSign, Users, MessageSquare } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

const COLORS = ["#FF6B00", "#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EC4899"];
const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

const leadsByPeriod = [
  { period: "Sem 1", total: 12, converted: 4 }, { period: "Sem 2", total: 18, converted: 7 },
  { period: "Sem 3", total: 9, converted: 3 }, { period: "Sem 4", total: 15, converted: 6 },
  { period: "Sem 5", total: 21, converted: 9 }, { period: "Sem 6", total: 14, converted: 5 },
  { period: "Sem 7", total: 17, converted: 8 }, { period: "Sem 8", total: 11, converted: 4 },
];

const conversionByStage = [
  { stage: "Novo Lead", rate: 100 }, { stage: "Contato", rate: 82 }, { stage: "Conversa", rate: 65 },
  { stage: "Agendou", rate: 50 }, { stage: "Avaliou", rate: 42 }, { stage: "Orcou", rate: 35 },
  { stage: "Negociou", rate: 28 }, { stage: "Fechou", rate: 22 },
];

const avgTimePerStage = [
  { stage: "Novo Lead", days: 1.2 }, { stage: "Contato", days: 0.8 }, { stage: "Conversa", days: 2.5 },
  { stage: "Agendou", days: 3.1 }, { stage: "Avaliou", days: 1.5 }, { stage: "Orcou", days: 4.2 },
  { stage: "Negociou", days: 5.8 }, { stage: "Fechou", days: 0 },
];

const lossReasons = [
  { reason: "Preco", value: 35 }, { reason: "Concorrente", value: 15 },
  { reason: "Timing", value: 20 }, { reason: "Nao respondeu", value: 25 }, { reason: "Outro", value: 5 },
];

const appointmentsByType = [
  { type: "Avaliacao", total: 45, noshow: 5 }, { type: "Procedimento", total: 38, noshow: 2 },
  { type: "Retorno", total: 22, noshow: 4 }, { type: "Encaixe", total: 8, noshow: 1 },
];

const scheduleHeatmap = [
  { hour: "8h", seg: 4, ter: 6, qua: 5, qui: 7, sex: 3, sab: 2 },
  { hour: "9h", seg: 7, ter: 8, qua: 6, qui: 9, sex: 5, sab: 4 },
  { hour: "10h", seg: 9, ter: 10, qua: 8, qui: 10, sex: 7, sab: 6 },
  { hour: "11h", seg: 6, ter: 7, qua: 9, qui: 8, sex: 6, sab: 3 },
  { hour: "14h", seg: 8, ter: 9, qua: 7, qui: 8, sex: 6, sab: 0 },
  { hour: "15h", seg: 7, ter: 8, qua: 8, qui: 7, sex: 5, sab: 0 },
  { hour: "16h", seg: 5, ter: 6, qua: 6, qui: 5, sex: 4, sab: 0 },
  { hour: "17h", seg: 3, ter: 4, qua: 3, qui: 4, sex: 2, sab: 0 },
];

const revenueByMonth = [
  { month: "Set", faturado: 62000, previsto: 68000 }, { month: "Out", faturado: 71000, previsto: 75000 },
  { month: "Nov", faturado: 68000, previsto: 72000 }, { month: "Dez", faturado: 95000, previsto: 90000 },
  { month: "Jan", faturado: 82000, previsto: 85000 }, { month: "Fev", faturado: 87500, previsto: 92000 },
];

const productivityData = [
  { name: "Dra. Marina", pacientes: 42, procedimentos: 38, faturamento: 45000, conversao: 72 },
  { name: "Dr. Ricardo", pacientes: 35, procedimentos: 30, faturamento: 32000, conversao: 65 },
  { name: "Dr. Paulo", pacientes: 18, procedimentos: 15, faturamento: 10500, conversao: 58 },
];

const communicationData = {
  avgResponseTime: 12,
  messagesSent: 1240,
  messagesReceived: 890,
  responseRate: 78,
  templateUsage: [
    { name: "Confirmacao D-1", count: 320 }, { name: "Boas-vindas", count: 180 },
    { name: "Follow-up orcamento", count: 95 }, { name: "Pos-procedimento", count: 88 },
    { name: "Reativacao", count: 45 },
  ],
};

export default function Reports() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatorios</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ultimos 7 dias</SelectItem>
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="90d">Ultimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Exportar</Button>
        </div>
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="leads"><Users className="mr-2 h-4 w-4" />Leads</TabsTrigger>
          <TabsTrigger value="agenda"><Calendar className="mr-2 h-4 w-4" />Agenda</TabsTrigger>
          <TabsTrigger value="financial"><DollarSign className="mr-2 h-4 w-4" />Financeiro</TabsTrigger>
          <TabsTrigger value="productivity"><FileText className="mr-2 h-4 w-4" />Produtividade</TabsTrigger>
          <TabsTrigger value="communication"><MessageSquare className="mr-2 h-4 w-4" />Comunicacao</TabsTrigger>
        </TabsList>

        {/* LEADS */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">Leads por Semana</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={leadsByPeriod}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend /><Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4,4,0,0]} /><Bar dataKey="converted" name="Convertidos" fill="#22C55E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Taxa de Conversao por Etapa</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={conversionByStage}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="rate" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Tempo Medio por Etapa (dias)</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={avgTimePerStage} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="days" fill="#A855F7" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Motivos de Perda</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={lossReasons} dataKey="value" nameKey="reason" cx="50%" cy="50%" outerRadius={80} label>
                  {lossReasons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Legend /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} /></PieChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* AGENDA */}
        <TabsContent value="agenda" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">Agendamentos por Tipo</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={appointmentsByType}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend /><Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4,4,0,0]} /><Bar dataKey="noshow" name="No-show" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Ocupacao da Agenda</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-muted-foreground"><th className="p-2">Hora</th><th className="p-2">Seg</th><th className="p-2">Ter</th><th className="p-2">Qua</th><th className="p-2">Qui</th><th className="p-2">Sex</th><th className="p-2">Sab</th></tr></thead>
                  <tbody>{scheduleHeatmap.map(row => (
                    <tr key={row.hour}><td className="p-2 font-medium">{row.hour}</td>
                      {["seg","ter","qua","qui","sex","sab"].map(day => {
                        const v = row[day as keyof typeof row] as number;
                        const opacity = Math.min(v / 10, 1);
                        return <td key={day} className="p-2 text-center rounded" style={{ backgroundColor: `rgba(255,107,0,${opacity * 0.6})` }}>{v}</td>;
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-sm">Faturado vs Previsto</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueByMonth}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend /><Line type="monotone" dataKey="faturado" name="Faturado" stroke="hsl(var(--primary))" strokeWidth={2} /><Line type="monotone" dataKey="previsto" name="Previsto" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* PRODUTIVIDADE */}
        <TabsContent value="productivity" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-sm">Produtividade por Profissional</CardTitle></CardHeader><CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Profissional</th><th className="pb-3 font-medium">Pacientes</th>
                  <th className="pb-3 font-medium">Procedimentos</th><th className="pb-3 font-medium">Faturamento</th>
                  <th className="pb-3 font-medium">Conversao</th>
                </tr></thead>
                <tbody>{productivityData.map(p => (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="py-3 font-medium">{p.name}</td><td className="py-3">{p.pacientes}</td>
                    <td className="py-3">{p.procedimentos}</td><td className="py-3">{formatBRL(p.faturamento)}</td>
                    <td className="py-3"><span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">{p.conversao}%</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* COMUNICACAO */}
        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Tempo Medio Resposta</p><p className="text-2xl font-bold">{communicationData.avgResponseTime} min</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Msgs Enviadas</p><p className="text-2xl font-bold">{communicationData.messagesSent}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Msgs Recebidas</p><p className="text-2xl font-bold">{communicationData.messagesReceived}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Taxa de Resposta</p><p className="text-2xl font-bold">{communicationData.responseRate}%</p></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-sm">Templates Mais Usados</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={communicationData.templateUsage} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={140} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
