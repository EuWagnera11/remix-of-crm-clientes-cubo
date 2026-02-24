import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft, Building2, MapPin, User, Users, Calendar,
  MessageSquare, Eye, TrendingUp, Mail, Phone, Clock,
} from "lucide-react";

// Mock data - will be replaced with Supabase queries
const mockClinics = [
  { id: "1", name: "Clinica Estetica SP", status: "ativa" as const, leads: 340, appointments: 180, revenue: 245000, city: "Sao Paulo", state: "SP", owner: "Dr. Carlos Silva", email: "carlos@clinicasp.com", phone: "(11) 99999-0001", createdAt: "2024-03-15", lastAccess: "2025-02-24", whatsappMsgs: 2100, automations: 8, users: [
    { name: "Dr. Carlos Silva", role: "clinic_owner", email: "carlos@clinicasp.com", lastAccess: "2025-02-24" },
    { name: "Maria Santos", role: "clinic_staff", email: "maria@clinicasp.com", lastAccess: "2025-02-23" },
    { name: "Joana Lima", role: "clinic_receptionist", email: "joana@clinicasp.com", lastAccess: "2025-02-24" },
  ]},
  { id: "2", name: "OdontoVida", status: "ativa" as const, leads: 280, appointments: 150, revenue: 185000, city: "Rio de Janeiro", state: "RJ", owner: "Dra. Fernanda Costa", email: "fernanda@odontovida.com", phone: "(21) 99999-0002", createdAt: "2024-05-10", lastAccess: "2025-02-23", whatsappMsgs: 1800, automations: 5, users: [
    { name: "Dra. Fernanda Costa", role: "clinic_owner", email: "fernanda@odontovida.com", lastAccess: "2025-02-23" },
    { name: "Lucas Oliveira", role: "clinic_staff", email: "lucas@odontovida.com", lastAccess: "2025-02-22" },
  ]},
  { id: "3", name: "Derma Center", status: "ativa" as const, leads: 220, appointments: 120, revenue: 142000, city: "Belo Horizonte", state: "MG", owner: "Dr. Marcos Almeida", email: "marcos@dermacenter.com", phone: "(31) 99999-0003", createdAt: "2024-06-20", lastAccess: "2025-02-24", whatsappMsgs: 1500, automations: 3, users: [
    { name: "Dr. Marcos Almeida", role: "clinic_owner", email: "marcos@dermacenter.com", lastAccess: "2025-02-24" },
  ]},
  { id: "4", name: "HOF Premium", status: "ativa" as const, leads: 200, appointments: 110, revenue: 198000, city: "Curitiba", state: "PR", owner: "Dra. Paula Mendes", email: "paula@hofpremium.com", phone: "(41) 99999-0004", createdAt: "2024-01-08", lastAccess: "2025-02-24", whatsappMsgs: 1200, automations: 6, users: [
    { name: "Dra. Paula Mendes", role: "clinic_owner", email: "paula@hofpremium.com", lastAccess: "2025-02-24" },
    { name: "Roberto Dias", role: "clinic_staff", email: "roberto@hofpremium.com", lastAccess: "2025-02-21" },
  ]},
  { id: "5", name: "Clinica Bela Face", status: "ativa" as const, leads: 180, appointments: 95, revenue: 78000, city: "Brasilia", state: "DF", owner: "Dra. Ana Ribeiro", email: "ana@belaface.com", phone: "(61) 99999-0005", createdAt: "2024-08-01", lastAccess: "2025-02-22", whatsappMsgs: 1100, automations: 4, users: [
    { name: "Dra. Ana Ribeiro", role: "clinic_owner", email: "ana@belaface.com", lastAccess: "2025-02-22" },
  ]},
  { id: "6", name: "Sorriso Perfeito", status: "inativa" as const, leads: 15, appointments: 8, revenue: 3200, city: "Salvador", state: "BA", owner: "Dr. Pedro Souza", email: "pedro@sorrisoperfeito.com", phone: "(71) 99999-0006", createdAt: "2024-09-12", lastAccess: "2025-01-05", whatsappMsgs: 120, automations: 1, users: [
    { name: "Dr. Pedro Souza", role: "clinic_owner", email: "pedro@sorrisoperfeito.com", lastAccess: "2025-01-05" },
  ]},
  { id: "7", name: "Corpo e Mente", status: "cancelada" as const, leads: 45, appointments: 20, revenue: 12000, city: "Recife", state: "PE", owner: "Dra. Lucia Ferreira", email: "lucia@corpoemente.com", phone: "(81) 99999-0007", createdAt: "2024-04-18", lastAccess: "2024-12-15", whatsappMsgs: 340, automations: 2, users: [
    { name: "Dra. Lucia Ferreira", role: "clinic_owner", email: "lucia@corpoemente.com", lastAccess: "2024-12-15" },
  ]},
];

const STATUS_MAP = {
  ativa: { label: "Ativa", className: "bg-success/10 text-success border-success/20" },
  inativa: { label: "Inativa", className: "bg-muted text-muted-foreground border-border" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const ROLE_LABELS: Record<string, string> = {
  clinic_owner: "Proprietario",
  clinic_staff: "Equipe",
  clinic_receptionist: "Recepcionista",
};

const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function AdminClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clinic = mockClinics.find(c => c.id === id);

  if (!clinic) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Clinica nao encontrada</p>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ChevronLeft className="mr-2 h-4 w-4" />Voltar
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[clinic.status];

  const handleImpersonate = () => {
    // TODO: Set clinic context and redirect to CRM
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">CUBO</span>
              <span className="ml-1 text-xs text-muted-foreground">Admin</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 px-2 py-3">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => navigate("/admin")}>
            <ChevronLeft className="h-4 w-4" />Voltar para Clinicas
          </Button>
        </div>
        <div className="border-t border-border px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3 w-3" />Voltar ao CRM
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
            <span>/</span>
            <Link to="/admin" className="hover:text-foreground">Clinicas</Link>
            <span>/</span>
            <span className="text-foreground">{clinic.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{clinic.name}</h1>
                    <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{clinic.owner} · {clinic.city}, {clinic.state}</p>
                </div>
              </div>
              <Button onClick={handleImpersonate} className="gap-2">
                <Eye className="h-4 w-4" />Entrar no CRM
              </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Leads</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{clinic.leads}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Agendamentos</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{clinic.appointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">Msgs WhatsApp</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{clinic.whatsappMsgs.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Faturamento</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{formatBRL(clinic.revenue)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informacoes da Clinica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Proprietario</p>
                      <p className="text-sm font-medium">{clinic.owner}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="text-sm">{clinic.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="text-sm">{clinic.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Localizacao</p>
                      <p className="text-sm">{clinic.city}, {clinic.state}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cadastro / Ultimo Acesso</p>
                      <p className="text-sm">{clinic.createdAt} · {clinic.lastAccess}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Usuarios ({clinic.users.length})</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Adicionar</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clinic.users.map((u, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-medium">
                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">{ROLE_LABELS[u.role] || u.role}</Badge>
                          <p className="mt-1 text-[10px] text-muted-foreground">Acesso: {u.lastAccess}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-2xl font-bold">{clinic.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads Totais</p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-2xl font-bold">{clinic.appointments}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos</p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-2xl font-bold">{clinic.whatsappMsgs.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Msgs WhatsApp</p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-2xl font-bold">{clinic.automations}</p>
                    <p className="text-xs text-muted-foreground">Automacoes Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
