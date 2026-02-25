import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Upload, RotateCcw, Palette, WifiOff } from "lucide-react";
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

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useWhiteLabel();
  const { clinicId, isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [clinicForm, setClinicForm] = useState({ name: "", phone: "", email: "" });

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
      toast({ title: "Arquivo invalido", description: "Selecione uma imagem", variant: "destructive" });
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
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      <Tabs defaultValue="whitelabel">
        <TabsList className="bg-accent">
          <TabsTrigger value="whitelabel" className="gap-1.5"><Palette className="h-3.5 w-3.5" /> White Label</TabsTrigger>
          <TabsTrigger value="clinic">Dados da Clinica</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="integrations">Integracoes</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        </TabsList>

        {/* White Label */}
        <TabsContent value="whitelabel" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Identidade Visual</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => { resetSettings(); toast({ title: "Configuracoes restauradas!" }); }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrao
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome da Marca</Label><Input value={settings.clinicName} onChange={(e) => updateSettings({ clinicName: e.target.value })} placeholder="Nome que aparecera na sidebar" /></div>
                <div><Label>Subtitulo</Label><Input value={settings.clinicSubtitle} onChange={(e) => updateSettings({ clinicSubtitle: e.target.value })} placeholder="Ex: CRM, Clinica, Studio" /></div>
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
                <Label>Cor Primaria</Label>
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pre-visualizacao</p>
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
                  <Button size="sm" style={{ backgroundColor: `hsl(${settings.primaryColor})` }} className="text-white">Botao Primario</Button>
                  <Button size="sm" variant="outline" style={{ borderColor: `hsl(${settings.primaryColor})`, color: `hsl(${settings.primaryColor})` }}>Botao Outline</Button>
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
            <CardHeader><CardTitle className="text-sm">Informacoes Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome da Clinica</Label><Input value={clinicForm.name} onChange={e => setClinicForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da clinica" /></div>
                <div><Label>Telefone</Label><Input value={clinicForm.phone} onChange={e => setClinicForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 0000-0000" /></div>
                <div><Label>E-mail</Label><Input value={clinicForm.email} onChange={e => setClinicForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@clinica.com" /></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar Alteracoes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Horario de Funcionamento</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"].map((day, i) => (
                  <div key={day} className="flex items-center gap-4 text-sm">
                    <span className="w-20">{day}</span>
                    <Switch defaultChecked={i < 6} />
                    <Input className="w-24" placeholder="08:00" disabled={i === 6} />
                    <span>ate</span>
                    <Input className="w-24" placeholder="18:00" disabled={i === 6} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-4">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Nenhum membro da equipe cadastrado.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Adicione profissionais e recepcionistas ao sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Integracoes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3"><WifiOff className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">WhatsApp (Evolution API)</p><p className="text-xs text-muted-foreground">Nao conectado</p></div></div>
                <Button variant="outline" size="sm" disabled>Configurar</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3"><WifiOff className="h-5 w-5 text-destructive" /><div><p className="text-sm font-medium">Google Calendar</p><p className="text-xs text-muted-foreground">Nao conectado</p></div></div>
                <Button variant="outline" size="sm" disabled>Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">LGPD - Consentimento</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure os termos de consentimento e politicas de privacidade da clinica.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
