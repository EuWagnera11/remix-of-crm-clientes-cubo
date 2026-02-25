import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function Agenda() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn("px-3 py-1.5 text-xs transition-colors", viewMode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
                {m === 'day' ? 'Dia' : m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium min-w-[160px] text-center">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Agendamento</Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum agendamento</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Os agendamentos aparecerão aqui conforme forem criados.</p>
        </CardContent>
      </Card>
    </div>
  );
}
