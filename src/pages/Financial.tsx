import { useMemo } from "react";
import { DollarSign, TrendingUp, AlertTriangle, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth } from "date-fns";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  aprovado: { label: "Aprovado", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  perdido: { label: "Perdido", variant: "outline" },
};

export default function Financial() {
  const { clinicId } = useAuth();
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["financial-budgets", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase
        .from("budgets")
        .select("*, patients(name)")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!clinicId,
  });

  const stats = useMemo(() => {
    if (!budgets?.length) return { revenue: 0, pending: 0, overdue: 0, ticket: 0 };
    const approved = budgets.filter(b => b.status === "aprovado");
    const monthApproved = approved.filter(b => b.created_at >= monthStart);
    const revenue = monthApproved.reduce((s, b) => s + (b.total || 0), 0);
    const pending = budgets.filter(b => b.status === "pendente").reduce((s, b) => s + (b.total || 0), 0);
    const ticket = approved.length > 0 ? approved.reduce((s, b) => s + (b.total || 0), 0) / approved.length : 0;
    return { revenue, pending, overdue: 0, ticket };
  }, [budgets, monthStart]);

  if (!clinicId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground">Selecione uma clínica para ver o financeiro.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Faturamento do Mês</p></div>
            <p className="text-2xl font-bold">R$ {stats.revenue.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-amber-500" /><p className="text-sm text-muted-foreground">A Receber (Pendentes)</p></div>
            <p className="text-2xl font-bold">R$ {stats.pending.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-sm text-muted-foreground">Em Atraso</p></div>
            <p className="text-2xl font-bold">R$ {stats.overdue.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Ticket Médio</p></div>
            <p className="text-2xl font-bold">R$ {stats.ticket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Movimentações (Orçamentos)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : !budgets?.length ? (
            <div className="py-16 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma movimentação financeira</p>
              <p className="mt-1 text-sm text-muted-foreground/70">As cobranças aparecerão aqui conforme orçamentos forem criados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map(b => {
                  const st = STATUS_MAP[b.status || "pendente"] || STATUS_MAP.pendente;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{(b as any).patients?.name || "—"}</TableCell>
                      <TableCell>{format(new Date(b.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell>R$ {(b.total || 0).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{b.discount ? `${b.discount}%` : "—"}</TableCell>
                      <TableCell>{b.installments || 1}x</TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
