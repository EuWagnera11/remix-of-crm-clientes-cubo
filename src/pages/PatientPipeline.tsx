import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockPatients, PATIENT_PIPELINE_STAGES, LOSS_REASONS, type Patient } from "@/lib/mock-data";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function PatientPipeline() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [moveDialog, setMoveDialog] = useState<{ patient: Patient; targetStage: number } | null>(null);
  const [note, setNote] = useState("");
  const [lossReason, setLossReason] = useState("");

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (stageId: number) => {
    if (!draggedId) return;
    const patient = patients.find((p) => p.id === draggedId);
    if (!patient || patient.pipeline_stage === stageId) { setDraggedId(null); return; }

    if (stageId === 10) {
      setMoveDialog({ patient, targetStage: stageId });
    } else {
      setPatients((prev) => prev.map((p) => p.id === draggedId ? { ...p, pipeline_stage: stageId, pipeline_stage_days: 0 } : p));
    }
    setDraggedId(null);
  };

  const confirmMove = () => {
    if (!moveDialog) return;
    setPatients((prev) => prev.map((p) => p.id === moveDialog.patient.id ? { ...p, pipeline_stage: moveDialog.targetStage, pipeline_stage_days: 0 } : p));
    setMoveDialog(null);
    setNote("");
    setLossReason("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pipeline de Pacientes</h1>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {PATIENT_PIPELINE_STAGES.map((stage) => {
          const stagePatients = patients.filter((p) => p.pipeline_stage === stage.id);
          const totalValue = stagePatients.reduce((sum, p) => sum + (p.budget_value || 0), 0);

          return (
            <div
              key={stage.id}
              className="flex w-[260px] shrink-0 flex-col rounded-lg border border-border bg-card"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">{stagePatients.length}</Badge>
                  {totalValue > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</span>}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2 min-h-[100px]">
                {stagePatients.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => handleDragStart(p.id)}
                    className="cursor-grab rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30 active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        {p.procedures_interest[0] && <p className="text-xs text-muted-foreground truncate">{p.procedures_interest[0]}</p>}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      {p.budget_value ? <span className="font-medium text-foreground">{formatCurrency(p.budget_value)}</span> : <span />}
                      <span>{p.pipeline_stage_days}d na etapa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loss Dialog */}
      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover para Perdido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo da perda *</label>
              <Select value={lossReason} onValueChange={setLossReason}>
                <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                <SelectContent>
                  {LOSS_REASONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Nota</label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Adicione detalhes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialog(null)}>Cancelar</Button>
            <Button onClick={confirmMove} disabled={!lossReason} variant="destructive">Confirmar Perda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
