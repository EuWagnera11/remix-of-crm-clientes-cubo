import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const STAGES = [
  { key: "lead", label: "Lead", color: "bg-blue-500" },
  { key: "contacted", label: "Contatado", color: "bg-yellow-500" },
  { key: "scheduled", label: "Agendado", color: "bg-primary" },
  { key: "in_treatment", label: "Em Tratamento", color: "bg-green-500" },
  { key: "em_tratamento", label: "Em Tratamento", color: "bg-green-500" },
  { key: "paciente_ativo", label: "Paciente Ativo", color: "bg-emerald-500" },
  { key: "vip", label: "VIP", color: "bg-amber-500" },
  { key: "completed", label: "Concluído", color: "bg-emerald-500" },
  { key: "lost", label: "Perdido", color: "bg-destructive" },
  { key: "inativo", label: "Inativo", color: "bg-muted-foreground" },
];

export default function PatientPipeline() {
  const { clinicId, isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const effectiveClinicId = clinicId || selectedClinicId;

  const { data: clinics } = useQuery({
    queryKey: ["clinics-for-select"],
    queryFn: async () => { const { data } = await supabase.from("clinics").select("id, name"); return data || []; },
    enabled: isPlatformAdmin && !clinicId,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients-pipeline", effectiveClinicId],
    queryFn: async () => {
      const filters: any = { order: { column: "updated_at", ascending: false } };
      if (effectiveClinicId) filters.eq = { clinic_id: effectiveClinicId };
      return await fetchAll("patients", "*", filters);
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from("patients").update({ stage }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients-pipeline"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline de Pacientes</h1>
        {isPlatformAdmin && !clinicId && (
          <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Selecionar clínica" /></SelectTrigger>
            <SelectContent>{clinics?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum paciente no pipeline</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Cadastre pacientes na aba "Pacientes / Leads".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stagePatients = patients.filter(p => (p.stage || "lead") === stage.key);
            return (
              <div key={stage.key} className="min-w-[240px] flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span className="text-xs text-muted-foreground">({stagePatients.length})</span>
                </div>
                <div className="space-y-2">
                  {stagePatients.map(p => (
                    <Card key={p.id} className="bg-card">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.phone || p.email || "Sem contato"}</p>
                        <Select value={p.stage || "lead"} onValueChange={v => moveMutation.mutate({ id: p.id, stage: v })}>
                          <SelectTrigger className="h-7 mt-2 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
