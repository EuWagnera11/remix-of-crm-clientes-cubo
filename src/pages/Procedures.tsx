import { useState } from "react";
import { Plus, Search, Edit2, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockProcedures, type Procedure } from "@/lib/mock-data";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const categories = [...new Set(mockProcedures.map((p) => p.category))];

export default function Procedures() {
  const [procedures, setProcedures] = useState<Procedure[]>(mockProcedures);
  const [search, setSearch] = useState("");
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = procedures.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditingProcedure({ id: String(Date.now()), name: "", description: "", category: "", suggested_price: 0, duration_minutes: 30, active: true });
    setIsNew(true);
  };

  const openEdit = (p: Procedure) => { setEditingProcedure({ ...p }); setIsNew(false); };

  const save = () => {
    if (!editingProcedure) return;
    if (isNew) {
      setProcedures((prev) => [...prev, editingProcedure]);
    } else {
      setProcedures((prev) => prev.map((p) => p.id === editingProcedure.id ? editingProcedure : p));
    }
    setEditingProcedure(null);
  };

  const toggleActive = (id: string) => {
    setProcedures((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalogo de Procedimentos</h1>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Novo Procedimento</Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar procedimento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor Sugerido</TableHead>
                <TableHead className="text-right">Duracao</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.description}</p></div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{p.category}</Badge></TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(p.suggested_price)}</TableCell>
                  <TableCell className="text-right text-sm">{p.duration_minutes}min</TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "outline"} className={`text-xs ${p.active ? "bg-success text-success-foreground" : ""}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(p.id)}><Power className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingProcedure} onOpenChange={() => setEditingProcedure(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isNew ? "Novo Procedimento" : "Editar Procedimento"}</DialogTitle></DialogHeader>
          {editingProcedure && (
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={editingProcedure.name} onChange={(e) => setEditingProcedure({ ...editingProcedure, name: e.target.value })} /></div>
              <div><Label>Descricao</Label><Textarea value={editingProcedure.description} onChange={(e) => setEditingProcedure({ ...editingProcedure, description: e.target.value })} /></div>
              <div><Label>Categoria</Label>
                <Select value={editingProcedure.category} onValueChange={(v) => setEditingProcedure({ ...editingProcedure, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valor sugerido (R$)</Label><Input type="number" value={editingProcedure.suggested_price} onChange={(e) => setEditingProcedure({ ...editingProcedure, suggested_price: Number(e.target.value) })} /></div>
                <div><Label>Duracao (min)</Label><Input type="number" value={editingProcedure.duration_minutes} onChange={(e) => setEditingProcedure({ ...editingProcedure, duration_minutes: Number(e.target.value) })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProcedure(null)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
