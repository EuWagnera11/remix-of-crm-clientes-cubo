import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Building2, DollarSign, TrendingDown, Star, AlertTriangle,
  Search, Eye, MoreHorizontal, ChevronRight, Users, BarChart3,
  CreditCard, Settings, LayoutDashboard, ChevronLeft, Plus, Upload, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// No mock data - all data comes from the database

interface Clinic {
  id: string; name: string; status: "ativa" | "inativa" | "cancelada";
  city: string | null; state: string | null; owner_name: string; owner_email: string;
  phone: string | null; email: string | null; primary_color: string | null;
  logo_url: string | null; notes: string | null; created_at: string;
}

const STATUS_COLORS = { ativa: "bg-success/10 text-success border-success/20", inativa: "bg-muted text-muted-foreground border-border", cancelada: "bg-destructive/10 text-destructive border-destructive/20" };

const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clinics" | "metrics">("dashboard");
  const [search, setSearch] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [newClinicOpen, setNewClinicOpen] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [newClinic, setNewClinic] = useState({
    name: "", city: "", state: "", phone: "", email: "",
    ownerName: "", ownerEmail: "", primaryColor: "24 95% 53%", notes: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Erro ao carregar clinicas');
    } else {
      setClinics((data as Clinic[]) || []);
    }
    setLoadingClinics(false);
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateClinic = async () => {
    if (!newClinic.name || !newClinic.ownerName || !newClinic.ownerEmail) {
      toast.error("Preencha os campos obrigatórios: nome da clínica, nome e e-mail do proprietário.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('clinics').insert({
      name: newClinic.name,
      city: newClinic.city || null,
      state: newClinic.state || null,
      phone: newClinic.phone || null,
      email: newClinic.email || null,
      owner_name: newClinic.ownerName,
      owner_email: newClinic.ownerEmail,
      primary_color: newClinic.primaryColor || null,
      notes: newClinic.notes || null,
    });
    setSaving(false);

    if (error) {
      console.error('Error creating clinic:', error);
      toast.error(`Erro ao criar clínica: ${error.message}`);
      return;
    }

    toast.success(`Clínica "${newClinic.name}" criada com sucesso!`);
    setNewClinicOpen(false);
    setNewClinic({ name: "", city: "", state: "", phone: "", email: "", ownerName: "", ownerEmail: "", primaryColor: "24 95% 53%", notes: "" });
    setLogoPreview(null);
    fetchClinics();
  };

  const activeClinics = clinics.filter(c => c.status === "ativa").length;
  const totalClinics = clinics.length;
  const canceladas = clinics.filter(c => c.status === "cancelada").length;

  const filteredClinics = clinics.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adminNavItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "clinics" as const, label: "Clínicas", icon: Building2 },
    { id: "metrics" as const, label: "Métricas de Uso", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-center gap-4 bg-primary text-sm font-medium text-primary-foreground">
          Você está visualizando como: {impersonating}
          <Button size="sm" variant="secondary" className="h-6 text-xs" onClick={() => setImpersonating(null)}>Sair</Button>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <div><span className="text-lg font-bold tracking-tight">CUBO</span><span className="ml-1 text-xs text-muted-foreground">Admin</span></div>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-3">
          <div className="flex flex-col gap-0.5">{adminNavItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", activeTab === item.id ? "bg-accent text-foreground border-l-2 border-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <item.icon className="h-4 w-4" /><span>{item.label}</span>
            </button>
          ))}</div>
        </nav>
        <div className="border-t border-border px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3 w-3" />Voltar ao CRM
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <span className="text-sm text-muted-foreground">Admin / {adminNavItems.find(i => i.id === activeTab)?.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">PA</div>
            <span className="text-sm font-medium">Platform Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Painel Administrativo CUBO</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Clinicas Ativas</p><p className="text-2xl font-bold">{activeClinics}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Clínicas</p><p className="text-2xl font-bold">{totalClinics}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Canceladas</p><p className="text-2xl font-bold text-destructive">{canceladas}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">NPS Produto</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
              </div>
              {clinics.length > 0 ? (
                <>
                  <Card><CardHeader><CardTitle className="text-sm">Clínicas Cadastradas</CardTitle></CardHeader><CardContent>
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                      <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-3 font-medium">Clínica</th><th className="pb-3 font-medium">Cidade</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Proprietário</th></tr></thead>
                      <tbody>{clinics.slice(0, 10).map((c) => (
                        <tr key={c.id} className="border-b border-border/50"><td className="py-3 font-medium">{c.name}</td><td className="py-3">{c.city || "—"}</td><td className="py-3"><Badge variant="outline" className={STATUS_COLORS[c.status as keyof typeof STATUS_COLORS]}>{c.status}</Badge></td><td className="py-3">{c.owner_name}</td></tr>
                      ))}</tbody>
                    </table></div>
                  </CardContent></Card>
                </>
              ) : (
                <Card><CardContent className="py-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">Nenhuma clínica cadastrada ainda.</p>
                  <p className="text-sm text-muted-foreground/70">Vá até a aba "Clínicas" para cadastrar a primeira.</p>
                </CardContent></Card>
              )}
            </div>
          )}

          {/* CLINICS */}
          {activeTab === "clinics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestão de Clínicas</h1>
                <Dialog open={newClinicOpen} onOpenChange={setNewClinicOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Nova Clínica</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-2">
                      {/* Dados Básicos */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados da Clínica</p>
                        <div className="space-y-2">
                          <Label htmlFor="nc-name">Nome da Clínica *</Label>
                          <Input id="nc-name" placeholder="Ex: Clínica Estética SP" value={newClinic.name} onChange={e => setNewClinic(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="nc-city">Cidade</Label>
                            <Input id="nc-city" placeholder="São Paulo" value={newClinic.city} onChange={e => setNewClinic(p => ({ ...p, city: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nc-state">Estado</Label>
                            <Input id="nc-state" placeholder="SP" maxLength={2} value={newClinic.state} onChange={e => setNewClinic(p => ({ ...p, state: e.target.value.toUpperCase() }))} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="nc-phone">Telefone</Label>
                            <Input id="nc-phone" placeholder="(11) 99999-0000" value={newClinic.phone} onChange={e => setNewClinic(p => ({ ...p, phone: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nc-email">E-mail da Clínica</Label>
                            <Input id="nc-email" type="email" placeholder="contato@clinica.com" value={newClinic.email} onChange={e => setNewClinic(p => ({ ...p, email: e.target.value }))} />
                          </div>
                        </div>
                      </div>

                      {/* Proprietário */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proprietário</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="nc-owner">Nome *</Label>
                            <Input id="nc-owner" placeholder="Dr. Fulano" value={newClinic.ownerName} onChange={e => setNewClinic(p => ({ ...p, ownerName: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nc-owner-email">E-mail de Acesso *</Label>
                            <Input id="nc-owner-email" type="email" placeholder="fulano@clinica.com" value={newClinic.ownerEmail} onChange={e => setNewClinic(p => ({ ...p, ownerEmail: e.target.value }))} />
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Um convite será enviado para este e-mail com acesso ao CRM.</p>
                      </div>

                      {/* Logo e Cores */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identidade Visual</p>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={() => logoInputRef.current?.click()}
                            className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-accent/30 transition-colors hover:border-primary/50 hover:bg-accent/60 overflow-hidden"
                          >
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">Logo</span>
                              </div>
                            )}
                          </div>
                          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="nc-color">Cor Primária (HSL)</Label>
                            <Input id="nc-color" placeholder="24 95% 53%" value={newClinic.primaryColor} onChange={e => setNewClinic(p => ({ ...p, primaryColor: e.target.value }))} />
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-md border border-border" style={{ backgroundColor: `hsl(${newClinic.primaryColor})` }} />
                              <span className="text-[11px] text-muted-foreground">Preview da cor</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Observações */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observações Internas</p>
                        <Textarea placeholder="Notas visíveis apenas pela equipe CUBO..." rows={3} value={newClinic.notes} onChange={e => setNewClinic(p => ({ ...p, notes: e.target.value }))} />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={handleCreateClinic} disabled={saving}>{saving ? "Criando..." : "Criar Clínica"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="h-9 w-64 bg-background pl-9 text-sm" placeholder="Buscar clínica..." value={search} onChange={e => setSearch(e.target.value)} /></div>
              </div>
              <Card><CardContent className="pt-6"><div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Clínica</th><th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Cidade</th><th className="pb-3 font-medium">Proprietário</th><th className="pb-3 font-medium">Criada em</th><th className="pb-3 font-medium">Ações</th>
                </tr></thead>
                <tbody>{loadingClinics ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : filteredClinics.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma clínica encontrada</td></tr>
                ) : filteredClinics.map(c => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3"><div><span className="font-medium">{c.name}</span><p className="text-xs text-muted-foreground">{c.owner_email}</p></div></td>
                    <td className="py-3"><Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status}</Badge></td>
                    <td className="py-3 text-muted-foreground">{c.city || '-'}{c.state ? `, ${c.state}` : ''}</td>
                    <td className="py-3">{c.owner_name}</td>
                    <td className="py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3"><div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild><Link to={`/admin/clinic/${c.id}`}><Eye className="mr-1 h-3 w-3" />Acessar</Link></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div></CardContent></Card>
            </div>
          )}

          {/* METRICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Métricas de Uso</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Msgs WhatsApp</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Agendamentos</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Orçamentos</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
              </div>
               <Card><CardHeader><CardTitle className="text-sm">Clínicas com Baixo Uso (Risco de Churn)</CardTitle></CardHeader><CardContent>
                <div className="space-y-2">
                  {clinics.filter(c => c.status === 'inativa' || c.status === 'cancelada').length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma clínica com baixo uso no momento.</p>
                  ) : clinics.filter(c => c.status === 'inativa' || c.status === 'cancelada').map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div><span className="font-medium text-sm">{c.name}</span><p className="text-xs text-muted-foreground">{c.owner_name} · {c.city || 'Sem cidade'}</p></div>
                      <Badge variant="outline" className="border-destructive/20 text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />Risco</Badge>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
