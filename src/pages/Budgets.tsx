import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Send, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockBudgets, mockPatients, mockProcedures, mockTeam, BUDGET_PIPELINE_STAGES, type Budget, type BudgetItem } from "@/lib/mock-data";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [search, setSearch] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const filtered = budgets.filter((b) => b.patient_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orcamentos</h1>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Orcamento</Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const stage = BUDGET_PIPELINE_STAGES.find((s) => s.id === b.pipeline_stage);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-sm">{b.patient_name}</TableCell>
                    <TableCell className="text-sm">{b.professional}</TableCell>
                    <TableCell className="text-sm">{b.created_at}</TableCell>
                    <TableCell className="text-sm">{b.valid_until}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(b.total)}</TableCell>
                    <TableCell>
                      {stage && <Badge style={{ backgroundColor: stage.color }} className="text-xs text-white">{stage.name}</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.payment_condition}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBudget(b)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Send className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBudget} onOpenChange={() => setSelectedBudget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalhes do Orcamento</DialogTitle></DialogHeader>
          {selectedBudget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Paciente:</span> {selectedBudget.patient_name}</div>
                <div><span className="text-muted-foreground">Profissional:</span> {selectedBudget.professional}</div>
                <div><span className="text-muted-foreground">Criado em:</span> {selectedBudget.created_at}</div>
                <div><span className="text-muted-foreground">Valido ate:</span> {selectedBudget.valid_until}</div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Unit.</TableHead>
                    <TableHead className="text-right">Desc %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBudget.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm font-medium">{item.procedure}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                      <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right text-sm">{item.discount}%</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <div className="space-y-1 text-sm text-right">
                  <div>Subtotal: {formatCurrency(selectedBudget.subtotal)}</div>
                  <div className="text-destructive">Desconto: -{formatCurrency(selectedBudget.discount)}</div>
                  <div className="text-lg font-bold">Total: {formatCurrency(selectedBudget.total)}</div>
                  <div className="text-muted-foreground">{selectedBudget.payment_condition}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBudget(null)}>Fechar</Button>
            <Button className="gap-2"><Send className="h-4 w-4" /> Enviar por WhatsApp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
