import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, RotateCcw, Palette, WifiOff, Plus, Trash2, UserPlus, Users, Shield, FileText } from "lucide-react";
import { useWhiteLabel } from "@/contexts/WhiteLabelContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const PRESET_COLORS = [
  { name: "Laranja CUBO", value: "24 95% 53%" },
  { name: "Azul Royal", value: "217 80% 55%" },
  { name: "Verde Esmeralda", value: "152 60% 40%" },
  { name: "Rosa Elegante", value: "340 65% 55%" },
  { name: "Dourado", value: "38 92% 50%" },
  { name: "Roxo Premium", value: "270 60% 55%" },
  { name: "Turquesa", value: "174 60% 45%" },
  { name: "Vermelho Intenso", value: "0 72% 51%" },
];

const ROLE_LABELS: Record<string, string> = {
  clinic_owner: "Proprietário",
  clinic_staff: "Profissional",
  clinic_receptionist: "Recepcionista",
};

function LgpdTab({ clinicId }: { clinicId: string }) {
  const queryClient = useQueryClient();
  const [termContent, setTermContent] = useState("");
  const [termTitle, setTermTitle] = useState("Termo de Consentimento");

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ["consent-terms", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase
        .from("consent_terms")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("version", { ascending: false });
      return data || [];
    },
    enabled: !!clinicId,
  });

  const activeTerm = terms.find((t: any) => t.active);

  useEffect(() => {
    if (activeTerm) {
      setTermContent(activeTerm.content);
      setTermTitle(activeTerm.title);
    }
  }, [activeTerm]);

  const { data: consents = [] } = useQuery({
    queryKey: ["patient-consents", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data } = await supabase
        .from("patient_consents")
        .select("*, patients(name)")
        .eq("clinic_id", clinicId)
        .order("consented_at", { ascending: false });
      return data || [];
    },
    enabled: !!clinicId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!clinicId) throw new Error("Sem clínica");
      // Deactivate old terms
      if (activeTerm) {
        await supabase.from("consent_terms").update({ active: false }).eq("clinic_id", clinicId);
      }
      const nextVersion = (terms[0]?.version || 0) + 1;
      const { error } = await supabase.from("consent_terms").insert({
        clinic_id: clinicId,
        title: termTitle,
        content: termContent,
        version: nextVersion,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-terms"] });
      toast({ title: "Termo salvo com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  if (!clinicId) return <Card><CardContent className="py-8 text-center text-muted-foreground">Selecione uma clínica.</CardContent></Card>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Termos de Consentimento LGPD</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título do Termo</Label>
            <Input value={termTitle} onChange={e => setTermTitle(e.target.value)} placeholder="Ex: Termo de Consentimento para Tratamento" />
          </div>
          <div>
            <Label>Conteúdo do Termo</Label>
            <Textarea
              value={termContent}
              onChange={e => setTermContent(e.target.value)}
              placeholder="Escreva aqui o texto do termo de consentimento que os pacientes deverão aceitar..."
              className="min-h-[200px]"
            />
          </div>
          {activeTerm && (
            <p className="text-xs text-muted-foreground">Versão atual: v{activeTerm.version} — Salvar criará uma nova versão.</p>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !termContent.trim()}>
            {saveMutation.isPending ? "Salvando..." : activeTerm ? "Salvar Nova Versão" : "Criar Termo"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Registros de Consentimento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground">Nenhum consentimento registrado.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Os registros aparecerão aqui conforme pacientes aceitarem os termos.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.patients?.name || "—"}</TableCell>
                    <TableCell className="capitalize">{c.consent_type === "treatment" ? "Tratamento" : c.consent_type === "marketing" ? "Marketing" : "Compartilhamento"}</TableCell>
                    <TableCell>
                      <Badge variant={c.consented ? (c.revoked_at ? "destructive" : "default") : "secondary"}>
                        {c.revoked_at ? "Revogado" : c.consented ? "Consentido" : "Recusado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(c.consented_at).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useWhiteLabel();
  const { clinicId, isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [clinicForm, setClinicForm] = useState({ name: "", phone: "", email: "" });
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ email: "", password: "", role: "clinic_staff" });

  // Fetch clinic data
  const { data: clinic } = useQuery({
    queryKey: ["clinic-settings", clinicId],
    queryFn: async () => {
      if (!clinicId) return null;
      const { data } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
      return data;
    },
    enabled: !!clinicId,
  });

  // For platform_admin, get first clinic
  const { data: adminClinics } = useQuery({
    queryKey: ["clinics-for-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("clinics").select("*");
      return data || [];
    },
    enabled: isPlatformAdmin && !clinicId,
  });

  const [selectedClinicId, setSelectedClinicId] = useState("");
  const effectiveClinic = clinic || adminClinics?.find(c => c.id === selectedClinicId);
  const effectiveClinicId = clinicId || selectedClinicId;

  useEffect(() => {
    if (effectiveClinic) {
      setClinicForm({
        name: effectiveClinic.name || "",
        phone: effectiveClinic.phone || "",
        email: effectiveClinic.email || "",
      });
    }
  }, [effectiveClinic]);

  useEffect(() => {
    if (adminClinics?.length && !selectedClinicId) {
      setSelectedClinicId(adminClinics[0].id);
    }
  }, [adminClinics, selectedClinicId]);

  // Team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ["team-members", effectiveClinicId],
    queryFn: async () => {
      if (!effectiveClinicId) return [];
      const { data, error } = await supabase.functions.invoke("manage-team", {
        body: { action: "list", clinic_id: effectiveClinicId },
      });
      if (error) throw error;
      return data?.users || [];
    },
    enabled: !!effectiveClinicId,
  });

  const createMemberMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveClinicId) throw new Error("Nenhuma clínica");
      const { data, error } = await supabase.functions.invoke("manage-team", {
        body: { action: "create", ...newMember, clinic_id: effectiveClinicId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setTeamDialogOpen(false);
      setNewMember({ email: "", password: "", role: "clinic_staff" });
      toast({ title: "Membro adicionado com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async ({ role_id, user_id }: { role_id: string; user_id: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-team", {
        body: { action: "delete", role_id, user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Membro removido!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ role_id, new_role }: { role_id: string; new_role: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-team", {
        body: { action: "update_role", role_id, new_role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Cargo atualizado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveClinicId) throw new Error("Nenhuma clínica selecionada");
      const { error } = await supabase.from("clinics").update({
        name: clinicForm.name,
        phone: clinicForm.phone || null,
        email: clinicForm.email || null,
      }).eq("id", effectiveClinicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-settings"] });
      queryClient.invalidateQueries({ queryKey: ["clinics-for-settings"] });
      toast({ title: "Dados salvos com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "faviconUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ [field]: reader.result as string });
      toast({ title: "Imagem atualizada!" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Tabs defaultValue="whitelabel">
        <TabsList className="bg-accent">
          <TabsTrigger value="whitelabel" className="gap-1.5"><Palette className="h-3.5 w-3.5" /> White Label</TabsTrigger>
          <TabsTrigger value="clinic">Dados da Clínica</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        </TabsList>

        {/* White Label */}
        <TabsContent value="whitelabel" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Identidade Visual</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => { resetSettings(); toast({ title: "Configurações restauradas!" }); }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome da Marca</Label><Input value={settings.clinicName} onChange={(e) => updateSettings({ clinicName: e.target.value })} placeholder="Nome que aparecerá na sidebar" /></div>
                <div><Label>Subtítulo</Label><Input value={settings.clinicSubtitle} onChange={(e) => updateSettings({ clinicSubtitle: e.target.value })} placeholder="Ex: CRM, Clínica, Studio" /></div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label>Logo (Sidebar)</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden">
                      {settings.logoUrl ? (<img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />) : (<span className="text-lg font-bold text-primary">{settings.clinicName.charAt(0)}</span>)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => logoInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Enviar logo</Button>
                      {settings.logoUrl && (<Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => updateSettings({ logoUrl: null })}>Remover</Button>)}
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logoUrl")} />
                </div>
                <div className="space-y-3">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden">
                      {settings.faviconUrl ? (<img src={settings.faviconUrl} alt="Favicon" className="h-full w-full object-contain p-0.5" />) : (<span className="text-xs font-bold text-primary">{settings.clinicName.charAt(0)}</span>)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => faviconInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Enviar favicon</Button>
                      {settings.faviconUrl && (<Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => updateSettings({ faviconUrl: null })}>Remover</Button>)}
                    </div>
                  </div>
                  <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "faviconUrl")} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Cor Primária</Label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button key={color.value} onClick={() => updateSettings({ primaryColor: color.value })} className="group flex flex-col items-center gap-1.5">
                      <div className="h-10 w-10 rounded-xl border-2 transition-all hover:scale-110" style={{ backgroundColor: `hsl(${color.value})`, borderColor: settings.primaryColor === color.value ? `hsl(${color.value})` : "transparent", boxShadow: settings.primaryColor === color.value ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${color.value})` : "none" }} />
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pré-visualização</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: `hsl(${settings.primaryColor})` }}>
                    {settings.logoUrl ? (<img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />) : (<span className="text-sm font-bold text-white">{settings.clinicName.charAt(0)}</span>)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold tracking-tight">{settings.clinicName}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{settings.clinicSubtitle}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" style={{ backgroundColor: `hsl(${settings.primaryColor})` }} className="text-white">Botão Primário</Button>
                  <Button size="sm" variant="outline" style={{ borderColor: `hsl(${settings.primaryColor})`, color: `hsl(${settings.primaryColor})` }}>Botão Outline</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinic" className="mt-4 space-y-4">
          {isPlatformAdmin && !clinicId && adminClinics && adminClinics.length > 0 && (
            <div className="flex gap-2">
              {adminClinics.map(c => (
                <Button key={c.id} variant={selectedClinicId === c.id ? "default" : "outline"} size="sm"
                  onClick={() => setSelectedClinicId(c.id)}>{c.name}</Button>
              ))}
            </div>
          )}
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Informações Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome da Clínica</Label><Input value={clinicForm.name} onChange={e => setClinicForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da clínica" /></div>
                <div><Label>Telefone</Label><Input value={clinicForm.phone} onChange={e => setClinicForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 0000-0000" /></div>
                <div><Label>E-mail</Label><Input value={clinicForm.email} onChange={e => setClinicForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@clinica.com" /></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Horário de Funcionamento</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day, i) => (
                  <div key={day} className="flex items-center gap-4 text-sm">
                    <span className="w-20">{day}</span>
                    <Switch defaultChecked={i < 6} />
                    <Input className="w-24" placeholder="08:00" disabled={i === 6} />
                    <span>até</span>
                    <Input className="w-24" placeholder="18:00" disabled={i === 6} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Membros da Equipe</CardTitle>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Adicionar Membro</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Novo Membro da Equipe</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>E-mail</Label><Input value={newMember.email} onChange={e => setNewMember(m => ({ ...m, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
                      <div><Label>Senha Inicial</Label><Input type="password" value={newMember.password} onChange={e => setNewMember(m => ({ ...m, password: e.target.value }))} placeholder="Mínimo 6 caracteres" /></div>
                      <div>
                        <Label>Cargo</Label>
                        <Select value={newMember.role} onValueChange={v => setNewMember(m => ({ ...m, role: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clinic_owner">Proprietário</SelectItem>
                            <SelectItem value="clinic_staff">Profissional</SelectItem>
                            <SelectItem value="clinic_receptionist">Recepcionista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => createMemberMutation.mutate()} disabled={createMemberMutation.isPending || !newMember.email || !newMember.password}>
                        {createMemberMutation.isPending ? "Criando..." : "Criar Membro"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
              ) : !teamMembers?.length ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-muted-foreground">Nenhum membro cadastrado nesta clínica.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Adicione profissionais e recepcionistas ao sistema.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.email}</TableCell>
                        <TableCell>
                          <Select value={member.role} onValueChange={v => updateRoleMutation.mutate({ role_id: member.role_id, new_role: v })}>
                            <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clinic_owner">Proprietário</SelectItem>
                              <SelectItem value="clinic_staff">Profissional</SelectItem>
                              <SelectItem value="clinic_receptionist">Recepcionista</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMemberMutation.mutate({ role_id: member.role_id, user_id: member.id })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Integrações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3"><WifiOff className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">WhatsApp (Evolution API)</p><p className="text-xs text-muted-foreground">Não conectado</p></div></div>
                <Button variant="outline" size="sm" disabled>Configurar</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3"><WifiOff className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">Google Calendar</p><p className="text-xs text-muted-foreground">Não conectado</p></div></div>
                <Button variant="outline" size="sm" disabled>Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd" className="mt-4 space-y-4">
          <LgpdTab clinicId={effectiveClinicId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

