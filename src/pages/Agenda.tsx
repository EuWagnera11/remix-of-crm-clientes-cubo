import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type ViewMode = "day" | "week" | "month";

const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  confirmado: "bg-green-500/10 text-green-500 border-green-500/20",
  realizado: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelado: "bg-destructive/10 text-destructive border-destructive/20",
  "no-show": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function Agenda() {
  const { clinicId, isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: "", procedure_id: "", date: "", time: "", duration_minutes: "60", notes: "" });
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const effectiveClinicId = clinicId || selectedClinicId;

  const { data: clinics } = useQuery({
    queryKey: ["clinics-for-select"],
    queryFn: async () => { const { data } = await supabase.from("clinics").select("id, name"); return data || []; },
    enabled: isPlatformAdmin && !clinicId,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients-select", effectiveClinicId],
    queryFn: async () => {
      let q = supabase.from("patients").select("id, name");
      if (effectiveClinicId) q = q.eq("clinic_id", effectiveClinicId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures-select", effectiveClinicId],
    queryFn: async () => {
      let q = supabase.from("procedures").select("id, name");
      if (effectiveClinicId) q = q.eq("clinic_id", effectiveClinicId);
      const { data } = await q;
      return data || [];
    },
  });

  const dateStr = currentDate.toISOString().split("T")[0];

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", effectiveClinicId, dateStr],
    queryFn: async () => {
      let q = supabase.from("appointments").select("*, patients(name), procedures(name)").eq("date", dateStr).order("time");
      if (effectiveClinicId) q = q.eq("clinic_id", effectiveClinicId);
      const { data } = await q;
      return data || [];
    },
  });

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveClinicId) throw new Error("Selecione uma clínica");
      const { error } = await supabase.from("appointments").insert({
        clinic_id: effectiveClinicId,
        patient_id: form.patient_id,
        procedure_id: form.procedure_id || null,
        date: form.date,
        time: form.time,
        duration_minutes: parseInt(form.duration_minutes) || 60,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowForm(false);
      setForm({ patient_id: "", procedure_id: "", date: "", time: "", duration_minutes: "60", notes: "" });
      toast({ title: "Agendamento criado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-3">
          {isPlatformAdmin && !clinicId && (
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Selecionar clinica" /></SelectTrigger>
              <SelectContent>{clinics?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["day", "week", "month"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn("px-3 py-1.5 text-xs transition-colors", viewMode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
                {m === "day" ? "Dia" : m === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium min-w-[160px] text-center">
              {currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="gap-2" onClick={() => { setForm(f => ({ ...f, date: dateStr })); setShowForm(true); }}><Plus className="h-4 w-4" /> Novo Agendamento</Button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum agendamento</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Clique em "Novo Agendamento" para adicionar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead><tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="p-3 font-medium">Horario</th>
                <th className="p-3 font-medium">Paciente</th>
                <th className="p-3 font-medium">Procedimento</th>
                <th className="p-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {appointments.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="p-3 font-mono text-sm">{a.time?.slice(0, 5)}</td>
                    <td className="p-3 font-medium">{a.patients?.name || "—"}</td>
                    <td className="p-3 text-sm">{a.procedures?.name || "—"}</td>
                    <td className="p-3"><Badge variant="outline" className={STATUS_COLORS[a.status || "agendado"]}>{a.status || "agendado"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Paciente *</Label>
              <Select value={form.patient_id} onValueChange={v => setForm(f => ({ ...f, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar paciente" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              {patients.length === 0 && <p className="text-xs text-muted-foreground mt-1">Cadastre um paciente antes de agendar.</p>}
            </div>
            <div><Label>Procedimento</Label>
              <Select value={form.procedure_id} onValueChange={v => setForm(f => ({ ...f, procedure_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar (opcional)" /></SelectTrigger>
                <SelectContent>{procedures.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><Label>Horario *</Label><Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
            </div>
            <div><Label>Duracao (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} /></div>
            <div><Label>Observacoes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.patient_id || !form.date || !form.time || createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Criar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
