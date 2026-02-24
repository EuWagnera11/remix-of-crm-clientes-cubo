import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DollarSign, TrendingUp, AlertTriangle, Users, Search, Filter,
  CheckCircle, Clock, XCircle, CreditCard, Receipt,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const revenueByMonth = [
  { month: "Set", value: 62000 },
  { month: "Out", value: 71000 },
  { month: "Nov", value: 68000 },
  { month: "Dez", value: 95000 },
  { month: "Jan", value: 82000 },
  { month: "Fev", value: 87500 },
];

const revenueByProcedure = [
  { name: "Harmonizacao", value: 35000 },
  { name: "Botox", value: 24000 },
  { name: "Lentes", value: 16000 },
  { name: "Preenchimento", value: 8500 },
  { name: "Clareamento", value: 4000 },
];

const revenueByProfessional = [
  { name: "Dra. Marina", value: 45000, color: "#3B82F6" },
  { name: "Dr. Ricardo", value: 32000, color: "#A855F7" },
  { name: "Dr. Paulo", value: 10500, color: "#22C55E" },
];

interface Installment {
  id: string;
  patient: string;
  procedure: string;
  total: number;
  installment_number: number;
  total_installments: number;
  due_date: string;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  payment_method?: string;
  paid_date?: string;
  amount: number;
}

const mockInstallments: Installment[] = [
  { id: "1", patient: "Ana Carolina Silva", procedure: "Harmonizacao Facial", total: 3500, installment_number: 3, total_installments: 5, due_date: "2026-02-25", status: "pendente", amount: 700 },
  { id: "2", patient: "Ana Carolina Silva", procedure: "Harmonizacao Facial", total: 3500, installment_number: 2, total_installments: 5, due_date: "2026-01-25", status: "pago", payment_method: "PIX", paid_date: "2026-01-25", amount: 700 },
  { id: "3", patient: "Juliana Ferreira Santos", procedure: "Preenchimento Labial", total: 3000, installment_number: 1, total_installments: 1, due_date: "2026-02-10", status: "pago", payment_method: "Cartao Credito", paid_date: "2026-02-10", amount: 3000 },
  { id: "4", patient: "Lucas Ribeiro", procedure: "Lente de Contato Dental", total: 18800, installment_number: 1, total_installments: 10, due_date: "2026-02-15", status: "atrasado", amount: 1880 },
  { id: "5", patient: "Lucas Ribeiro", procedure: "Lente de Contato Dental", total: 18800, installment_number: 2, total_installments: 10, due_date: "2026-03-15", status: "pendente", amount: 1880 },
  { id: "6", patient: "Patricia Lima Oliveira", procedure: "Skinbooster", total: 1500, installment_number: 1, total_installments: 1, due_date: "2026-02-15", status: "pago", payment_method: "Dinheiro", paid_date: "2026-02-15", amount: 1500 },
  { id: "7", patient: "Roberto Almeida", procedure: "Clareamento Dental", total: 800, installment_number: 1, total_installments: 2, due_date: "2026-02-20", status: "atrasado", amount: 400 },
  { id: "8", patient: "Roberto Almeida", procedure: "Clareamento Dental", total: 800, installment_number: 2, total_installments: 2, due_date: "2026-03-20", status: "pendente", amount: 400 },
  { id: "9", patient: "Fernando Gomes", procedure: "Implante Dental", total: 6000, installment_number: 1, total_installments: 6, due_date: "2026-03-01", status: "pendente", amount: 1000 },
  { id: "10", patient: "Ana Carolina Silva", procedure: "Botox", total: 1200, installment_number: 1, total_installments: 1, due_date: "2026-02-20", status: "pago", payment_method: "PIX", paid_date: "2026-02-20", amount: 1200 },
];

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  pago: { label: "Pago", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  atrasado: { label: "Atrasado", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelado: { label: "Cancelado", icon: XCircle, className: "bg-muted text-muted-foreground border-border" },
};

const CHART_COLORS = ["#FF6B00", "#3B82F6", "#A855F7", "#22C55E", "#F59E0B"];

const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function Financial() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);

  const totalReceived = mockInstallments.filter(i => i.status === "pago").reduce((s, i) => s + i.amount, 0);
  const totalPending = mockInstallments.filter(i => i.status === "pendente").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = mockInstallments.filter(i => i.status === "atrasado").reduce((s, i) => s + i.amount, 0);
  const uniquePatients = new Set(mockInstallments.filter(i => i.status === "pago").map(i => i.patient)).size;
  const ticketMedio = uniquePatients > 0 ? totalReceived / uniquePatients : 0;

  const filtered = mockInstallments.filter(i => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search && !i.patient.toLowerCase().includes(search.toLowerCase()) && !i.procedure.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Receipt className="mr-2 h-4 w-4" />Nova Cobranca</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Cobranca Avulsa</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Paciente" />
              <Input placeholder="Procedimento / Descricao" />
              <Input type="number" placeholder="Valor total (R$)" />
              <Select><SelectTrigger><SelectValue placeholder="Condicao" /></SelectTrigger>
                <SelectContent><SelectItem value="avista">A vista</SelectItem><SelectItem value="parcelado">Parcelado</SelectItem></SelectContent>
              </Select>
              <Select><SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
                <SelectContent>
                  {["Dinheiro","PIX","Cartao Credito","Cartao Debito","Boleto","Transferencia"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Faturamento do Mes</p><p className="text-2xl font-bold">{formatBRL(totalReceived)}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">A Receber</p><p className="text-2xl font-bold">{formatBRL(totalPending)}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10"><Clock className="h-5 w-5 text-info" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Em Atraso</p><p className="text-2xl font-bold text-destructive">{formatBRL(totalOverdue)}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Ticket Medio</p><p className="text-2xl font-bold">{formatBRL(ticketMedio)}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueByMonth}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Por Procedimento</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={revenueByProcedure} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                {revenueByProcedure.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie><Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Por Profissional</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByProfessional} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={90} />
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>{revenueByProfessional.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Cobrancas</CardTitle>
            <div className="flex gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="h-9 w-56 bg-background pl-9 text-sm" placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-36"><Filter className="mr-2 h-3 w-3" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Paciente</th><th className="pb-3 font-medium">Procedimento</th>
                <th className="pb-3 font-medium">Valor</th><th className="pb-3 font-medium">Parcela</th>
                <th className="pb-3 font-medium">Vencimento</th><th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Pagamento</th><th className="pb-3 font-medium"></th>
              </tr></thead>
              <tbody>
                {filtered.map(inst => {
                  const cfg = STATUS_CONFIG[inst.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={inst.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{inst.patient}</td>
                      <td className="py-3 text-muted-foreground">{inst.procedure}</td>
                      <td className="py-3">{formatBRL(inst.amount)}</td>
                      <td className="py-3">{inst.installment_number}/{inst.total_installments}</td>
                      <td className="py-3">{new Date(inst.due_date).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3"><Badge variant="outline" className={cfg.className}><Icon className="mr-1 h-3 w-3" />{cfg.label}</Badge></td>
                      <td className="py-3 text-muted-foreground">{inst.payment_method || "—"}</td>
                      <td className="py-3">{inst.status !== "pago" && inst.status !== "cancelado" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPaymentDialog(inst.id)}>
                          <CreditCard className="mr-1 h-3 w-3" />Registrar
                        </Button>
                      )}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select><SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
              <SelectContent>
                {["Dinheiro","PIX","Cartao Credito","Cartao Debito","Boleto","Transferencia"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" />
            <Input placeholder="Observacoes" />
            <Button className="w-full" onClick={() => setPaymentDialog(null)}>Confirmar Pagamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
