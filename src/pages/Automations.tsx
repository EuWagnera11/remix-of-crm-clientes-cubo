import { useState } from "react";
import { Play, Pause, ChevronDown, ChevronRight, MessageSquare, Bell, Clock, ArrowRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CadenceStep {
  id: string;
  delay: string;
  type: 'whatsapp' | 'alert' | 'action';
  description: string;
  template?: string;
}

interface Cadence {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  patientsInExecution: number;
  steps: CadenceStep[];
}

const mockCadences: Cadence[] = [
  {
    id: '1',
    name: 'Novo Lead',
    trigger: 'Quando um novo lead e criado',
    active: true,
    patientsInExecution: 5,
    steps: [
      { id: '1', delay: 'D0 0min', type: 'whatsapp', description: 'Boas-vindas automatica', template: 'Ola, {{nome}}! Seja bem-vindo(a) a {{clinica}}. Sou {{atendente}}, como posso ajuda-lo(a)?' },
      { id: '2', delay: 'D0 2h', type: 'alert', description: 'Alerta: Recepcao ligar para lead' },
      { id: '3', delay: 'D1 9h', type: 'whatsapp', description: 'Follow-up: Conseguiu ver nossa mensagem?', template: '{{nome}}, conseguiu ver nossa mensagem? Estamos a disposicao para ajuda-lo(a)!' },
      { id: '4', delay: 'D3 9h', type: 'whatsapp', description: 'Horarios disponiveis', template: '{{nome}}, temos horarios disponiveis esta semana para uma avaliacao. Gostaria de agendar?' },
      { id: '5', delay: 'D7 9h', type: 'whatsapp', description: 'Ultimo follow-up', template: '{{nome}}, estamos com vagas limitadas para avaliacao esta semana. Quer garantir a sua?' },
      { id: '6', delay: 'D30', type: 'whatsapp', description: 'Reativacao', template: '{{nome}}, faz tempo que nao nos falamos! Temos novidades que podem te interessar. Que tal agendar uma avaliacao?' },
    ],
  },
  {
    id: '2',
    name: 'Orcamento Enviado',
    trigger: 'Quando um orcamento e enviado ao paciente',
    active: true,
    patientsInExecution: 3,
    steps: [
      { id: '7', delay: 'D0', type: 'whatsapp', description: 'Envio do PDF do orcamento', template: '{{nome}}, segue o orcamento do(s) procedimento(s) que conversamos. Qualquer duvida, estou a disposicao.' },
      { id: '8', delay: 'D+3', type: 'whatsapp', description: 'Follow-up: Conseguiu analisar?', template: '{{nome}}, gostaria de saber se conseguiu analisar o orcamento que enviei. Posso esclarecer alguma duvida?' },
      { id: '9', delay: 'D+7', type: 'whatsapp', description: 'Condicoes especiais', template: '{{nome}}, temos condicoes especiais de pagamento este mes. Quer saber mais?' },
      { id: '10', delay: 'D+12', type: 'whatsapp', description: 'Orcamento expirando', template: '{{nome}}, o orcamento que enviei tem validade ate {{data_validade}}. Quer aproveitar as condicoes?' },
      { id: '11', delay: 'D+15', type: 'action', description: 'Mover para "Expirado" automaticamente' },
    ],
  },
  {
    id: '3',
    name: 'Pos-Procedimento',
    trigger: 'Quando um agendamento e finalizado',
    active: true,
    patientsInExecution: 2,
    steps: [
      { id: '12', delay: 'D0 2h', type: 'whatsapp', description: 'Como esta se sentindo?', template: '{{nome}}, como esta se sentindo apos o procedimento? Lembre-se de seguir as orientacoes que passamos.' },
      { id: '13', delay: 'D+3', type: 'whatsapp', description: 'Orientacoes de cuidados', template: '{{nome}}, passando para lembrar das orientacoes de cuidados pos-procedimento. Qualquer duvida, estamos aqui!' },
      { id: '14', delay: 'D+7', type: 'whatsapp', description: 'Retorno para avaliacao', template: '{{nome}}, esta na hora de agendar seu retorno! Posso verificar os horarios disponiveis?' },
      { id: '15', delay: 'D+30', type: 'whatsapp', description: 'Lembrete de manutencao', template: '{{nome}}, ja se passou um mes desde seu procedimento. Que tal agendar uma manutencao?' },
    ],
  },
  {
    id: '4',
    name: 'Reativacao de Inativos',
    trigger: 'Paciente sem visita ha X dias',
    active: false,
    patientsInExecution: 0,
    steps: [
      { id: '16', delay: '60 dias', type: 'whatsapp', description: 'Novidades da clinica', template: '{{nome}}, faz tempo que nao nos vemos! Que tal agendar uma avaliacao? Temos novidades que podem te interessar.' },
      { id: '17', delay: '90 dias', type: 'whatsapp', description: 'Oferta especial', template: '{{nome}}, sentimos sua falta! Temos condicoes especiais este mes para procedimentos de {{categoria}}. Quer saber mais?' },
      { id: '18', delay: '180 dias', type: 'whatsapp', description: 'Ultimo contato', template: '{{nome}}, gostavamos muito de te atender novamente! Temos muitas novidades. Entre em contato conosco!' },
    ],
  },
];

const STEP_ICONS = {
  whatsapp: MessageSquare,
  alert: Bell,
  action: ArrowRight,
};

const STEP_COLORS = {
  whatsapp: 'text-success',
  alert: 'text-warning',
  action: 'text-info',
};

export default function Automations() {
  const [cadences, setCadences] = useState<Cadence[]>(mockCadences);
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const toggleActive = (id: string) => {
    setCadences((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automacoes e Cadencias</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure sequencias automaticas de comunicacao com seus pacientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cadencias ativas</p>
            <p className="text-2xl font-bold mt-1">{cadences.filter(c => c.active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pacientes em execucao</p>
            <p className="text-2xl font-bold mt-1">{cadences.reduce((sum, c) => sum + c.patientsInExecution, 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de steps</p>
            <p className="text-2xl font-bold mt-1">{cadences.reduce((sum, c) => sum + c.steps.length, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cadences List */}
      <div className="space-y-3">
        {cadences.map((cadence) => {
          const isExpanded = expandedId === cadence.id;
          const Icon = cadence.active ? Pause : Play;

          return (
            <Card key={cadence.id} className={cn("bg-card transition-colors", !cadence.active && "opacity-60")}>
              <CardContent className="p-0">
                {/* Header */}
                <button
                  onClick={() => toggleExpand(cadence.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
                >
                  <div className={cn("transition-transform", isExpanded && "rotate-90")}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{cadence.name}</h3>
                      <Badge variant={cadence.active ? "default" : "secondary"} className={cn("text-xs", cadence.active && "bg-success text-success-foreground")}>
                        {cadence.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{cadence.trigger}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {cadence.patientsInExecution} em execucao
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {cadence.steps.length} steps
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch checked={cadence.active} onCheckedChange={() => toggleActive(cadence.id)} />
                    </div>
                  </div>
                </button>

                {/* Steps Timeline */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4">
                    <div className="ml-6 space-y-0">
                      {cadence.steps.map((step, i) => {
                        const StepIcon = STEP_ICONS[step.type];
                        const isLast = i === cadence.steps.length - 1;
                        return (
                          <div key={step.id} className="flex gap-3">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                              <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card", STEP_COLORS[step.type])}>
                                <StepIcon className="h-3.5 w-3.5" />
                              </div>
                              {!isLast && <div className="w-px flex-1 bg-border min-h-[20px]" />}
                            </div>
                            {/* Content */}
                            <div className={cn("pb-4 flex-1", isLast && "pb-0")}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{step.delay}</Badge>
                                <span className="text-sm font-medium">{step.description}</span>
                              </div>
                              {step.template && (
                                <div className="mt-1.5 rounded-lg border border-border bg-background p-2.5">
                                  <p className="text-xs text-muted-foreground italic">"{step.template}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground ml-6">
                      <Bell className="h-3 w-3" />
                      Cadencia pausa automaticamente quando paciente responde no WhatsApp
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
