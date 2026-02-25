import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft, Building2, MapPin, User, Calendar,
  MessageSquare, Eye, TrendingUp, Mail, Phone, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STATUS_MAP = {
  ativa: { label: "Ativa", className: "bg-success/10 text-success border-success/20" },
  inativa: { label: "Inativa", className: "bg-muted text-muted-foreground border-border" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

interface ClinicData {
  id: string;
  name: string;
  status: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  owner_name: string;
  owner_email: string;
  primary_color: string | null;
  logo_url: string | null;
  notes: string | null;
  created_at: string;
}

export default function AdminClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching clinic:", error);
        setClinic(null);
      } else {
        setClinic(data as ClinicData);
      }
      setLoading(false);
    };
    fetchClinic();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

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

  const statusInfo = STATUS_MAP[clinic.status as keyof typeof STATUS_MAP] || STATUS_MAP.ativa;

  const handleImpersonate = () => {
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
                  <p className="text-sm text-muted-foreground">{clinic.owner_name} · {clinic.city || "—"}{clinic.state ? `, ${clinic.state}` : ""}</p>
                </div>
              </div>
              <Button onClick={handleImpersonate} className="gap-2">
                <Eye className="h-4 w-4" />Entrar no CRM
              </Button>
            </div>

            {/* KPIs - placeholder until real metrics exist */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4" /><span className="text-xs">Leads</span></div><p className="mt-1 text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span className="text-xs">Agendamentos</span></div><p className="mt-1 text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /><span className="text-xs">Msgs WhatsApp</span></div><p className="mt-1 text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4" /><span className="text-xs">Faturamento</span></div><p className="mt-1 text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
            </div>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informacoes da Clinica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Proprietario</p><p className="text-sm font-medium">{clinic.owner_name}</p></div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">E-mail</p><p className="text-sm">{clinic.owner_email}</p></div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Telefone</p><p className="text-sm">{clinic.phone || "—"}</p></div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Localizacao</p><p className="text-sm">{clinic.city || "—"}{clinic.state ? `, ${clinic.state}` : ""}</p></div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Cadastro</p><p className="text-sm">{new Date(clinic.created_at).toLocaleDateString("pt-BR")}</p></div>
                </div>
                {clinic.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Observacoes</p>
                      <p className="text-sm">{clinic.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
