import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, CalendarPlus, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPatients, STATUS_OPTIONS, PATIENT_PIPELINE_STAGES, activityLog } from "@/lib/mock-data";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Paciente nao encontrado</p></div>;
  }

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === patient.status);
  const pipelineStage = PATIENT_PIPELINE_STAGES.find((s) => s.id === patient.pipeline_stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{patient.name}</h1>
                {statusInfo && (
                  <Badge variant="outline" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>{statusInfo.label}</Badge>
                )}
                {pipelineStage && (
                  <Badge style={{ backgroundColor: pipelineStage.color }} className="text-xs text-white">{pipelineStage.name}</Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {patient.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarPlus className="h-3.5 w-3.5" /> Agendar
            </Button>
            <Button size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Novo Orcamento
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo">
        <TabsList className="bg-accent">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="orcamentos">Orcamentos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4 mt-4">
          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">LTV</p><p className="text-xl font-bold">{formatCurrency(patient.ltv)}</p></CardContent></Card>
            <Card className="bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Procedimentos</p><p className="text-xl font-bold">{patient.procedures_count}</p></CardContent></Card>
            <Card className="bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">No-shows</p><p className="text-xl font-bold">{patient.no_shows}</p></CardContent></Card>
            <Card className="bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">NPS</p><p className="text-xl font-bold">{patient.nps_score ?? "-"}</p></CardContent></Card>
          </div>

          {/* Personal + Clinical */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card">
              <CardHeader><CardTitle className="text-sm">Dados Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Telefone" value={patient.phone} />
                <Row label="E-mail" value={patient.email} />
                <Row label="Genero" value={patient.gender || "-"} />
                <Row label="Nascimento" value={patient.birth_date || "-"} />
                <Row label="Instagram" value={patient.instagram || "-"} />
                {patient.address && <Row label="Endereco" value={`${patient.address.street}, ${patient.address.neighborhood} - ${patient.address.city}/${patient.address.state}`} />}
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader><CardTitle className="text-sm">Dados Clinicos</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Origem" value={`${patient.origin}${patient.origin_detail ? ` (${patient.origin_detail})` : ""}`} />
                <Row label="Classificacao" value={`Classe ${patient.value_class}`} />
                <Row label="Profissional pref." value={patient.preferred_professional || "-"} />
                <Row label="Alergias" value={patient.allergies || "-"} />
                <Row label="Obs. medicas" value={patient.medical_notes || "-"} />
                <div>
                  <span className="text-muted-foreground">Interesses: </span>
                  <span className="flex flex-wrap gap-1 mt-1">{patient.procedures_interest.map((p) => (<Badge key={p} variant="secondary" className="text-xs">{p}</Badge>))}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LGPD */}
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">LGPD - Consentimentos</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              <ConsentBadge label="WhatsApp" active={patient.consent_whatsapp} />
              <ConsentBadge label="E-mail" active={patient.consent_email} />
              <ConsentBadge label="SMS" active={patient.consent_sms} />
              {patient.consent_date && <span className="text-xs text-muted-foreground ml-auto">Consentimento em: {new Date(patient.consent_date).toLocaleString("pt-BR")}</span>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                {activityLog.map((a) => (
                  <div key={a.id} className="flex gap-3 border-l-2 border-border pl-4 pb-4">
                    <div className="flex-1">
                      <p className="text-sm">{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.user} - {new Date(a.date).toLocaleString("pt-BR")}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs h-fit">{a.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agendamentos" className="mt-4">
          <Card className="bg-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum agendamento registrado (Modulo Agenda - Fase 2)</CardContent></Card>
        </TabsContent>

        <TabsContent value="orcamentos" className="mt-4">
          <Card className="bg-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Visualize orcamentos na pagina de Orcamentos</CardContent></Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <Card className="bg-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Modulo Financeiro - Fase 3</CardContent></Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <Card className="bg-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum documento cadastrado</CardContent></Card>
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <Card className="bg-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma nota interna</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ConsentBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${active ? "border-success text-success" : "border-border text-muted-foreground"}`}>
      <div className={`h-2 w-2 rounded-full ${active ? "bg-success" : "bg-muted-foreground/30"}`} />
      {label}
    </div>
  );
}
