import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockBudgets, BUDGET_PIPELINE_STAGES, type Budget } from "@/lib/mock-data";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function BudgetPipeline() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (stageId: number) => {
    if (!draggedId) return;
    setBudgets((prev) => prev.map((b) => b.id === draggedId ? { ...b, pipeline_stage: stageId } : b));
    setDraggedId(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pipeline de Orcamentos</h1>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {BUDGET_PIPELINE_STAGES.map((stage) => {
          const stageBudgets = budgets.filter((b) => b.pipeline_stage === stage.id);
          const totalValue = stageBudgets.reduce((sum, b) => sum + b.total, 0);

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
                  <Badge variant="secondary" className="text-xs">{stageBudgets.length}</Badge>
                  {totalValue > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</span>}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2 min-h-[100px]">
                {stageBudgets.map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => setDraggedId(b.id)}
                    className="cursor-grab rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30 active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium">{b.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{b.professional}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-medium">{formatCurrency(b.total)}</span>
                      <span className="text-muted-foreground">{b.payment_condition}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Valido ate {b.valid_until}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
