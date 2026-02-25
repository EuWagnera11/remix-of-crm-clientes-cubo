import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contatado",
  scheduled: "Agendado",
  in_treatment: "Em Tratamento",
  completed: "Concluido",
  lost: "Perdido",
};

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-primary/10 text-primary border-primary/20",
  in_treatment: "bg-green-500/10 text-green-500 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  lost: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Patients() {
  const navigate = useNavigate();
  const { clinicId, isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", gender: "", source: "manual", stage: "lead", notes: "" });

  // For platform_admin, get first clinic
  const { data: clinics } = useQuery({
    queryKey: ["clinics-for-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clinics").select("id, name");
      return data || [];
    },
    enabled: isPlatformAdmin && !clinicId,
  });

  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const effectiveClinicId = clinicId || selectedClinicId;

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", effectiveClinicId],
    queryFn: async () => {
      let q = supabase.from("patients").select("*").order("created_at", { ascending: false });
      if (effectiveClinicId) q = q.eq("clinic_id", effectiveClinicId);
      const { data } = await q;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveClinicId) throw new Error("Selecione uma clínica");
      const { error } = await supabase.from("patients").insert({
        clinic_id: effectiveClinicId,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        cpf: form.cpf || null,
        gender: form.gender || null,
        source: form.source,
        stage: form.stage,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", cpf: "", gender: "", source: "manual", stage: "lead", notes: "" });
      toast({ title: "Paciente cadastrado com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro ao cadastrar", description: e.message, variant: "destructive" }),
  });

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search)) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pacientes / Leads</h1>
        <div className="flex gap-2">
          {isPlatformAdmin && !clinicId && (
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Selecionar clinica" /></SelectTrigger>
              <SelectContent>{clinics?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button className="gap-2" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Novo Paciente</Button>
        </div>
      </div>

      <Card className="bg-card">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum paciente cadastrado</p>
            <p className="mt-1 text-sm text-muted-foreground/70">Clique em "Novo Paciente" para adicionar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead><tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Telefone</th>
                <th className="p-3 font-medium">E-mail</th>
                <th className="p-3 font-medium">Etapa</th>
                <th className="p-3 font-medium">Origem</th>
                <th className="p-3 font-medium">Cadastro</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-sm">{p.phone || "—"}</td>
                    <td className="p-3 text-sm">{p.email || "—"}</td>
                    <td className="p-3"><Badge variant="outline" className={STAGE_COLORS[p.stage || "lead"]}>{STAGE_LABELS[p.stage || "lead"]}</Badge></td>
                    <td className="p-3 text-sm capitalize">{p.source || "—"}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Paciente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {isPlatformAdmin && !clinicId && (
              <div><Label>Clinica *</Label>
                <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar clinica" /></SelectTrigger>
                  <SelectContent>{clinics?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
              <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>CPF</Label><Input value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" /></div>
              <div><Label>Genero</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Origem</Label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Etapa</Label>
                <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAGE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Observacoes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observacoes sobre o paciente..." /></div>
            <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Cadastrar Paciente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
