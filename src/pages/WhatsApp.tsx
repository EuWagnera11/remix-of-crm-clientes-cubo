import { useState } from "react";
import { MessageSquare, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TEMPLATES = [
  { category: 'Atendimento', name: 'Boas-vindas', text: 'Ola, {{nome}}! Seja bem-vindo(a) a {{clinica}}. Sou {{atendente}}, como posso ajuda-lo(a)?' },
  { category: 'Atendimento', name: 'Solicitar dados', text: '{{nome}}, para darmos andamento, preciso de algumas informacoes. Pode me informar seu nome completo e data de nascimento?' },
  { category: 'Agenda', name: 'Confirmacao D-1', text: '{{nome}}, lembrando da sua consulta amanha ({{data}}) as {{horario}} com {{profissional}}. Confirma sua presenca? Responda SIM ou NAO.' },
  { category: 'Agenda', name: 'Lembrete 2h', text: '{{nome}}, sua consulta e daqui a 2 horas, as {{horario}}. Estamos aguardando voce!' },
  { category: 'Agenda', name: 'Resgate no-show', text: '{{nome}}, sentimos sua falta hoje! Quer remarcar sua consulta? Temos horarios disponiveis essa semana.' },
  { category: 'Orcamento', name: 'Envio de orcamento', text: '{{nome}}, segue o orcamento do(s) procedimento(s) que conversamos. Qualquer duvida, estou a disposicao.' },
  { category: 'Orcamento', name: 'Follow-up D+3', text: '{{nome}}, gostaria de saber se conseguiu analisar o orcamento que enviei. Posso esclarecer alguma duvida?' },
  { category: 'Pos-procedimento', name: 'Pos-procedimento', text: '{{nome}}, como esta se sentindo apos o procedimento? Lembre-se de seguir as orientacoes que passamos. Qualquer duvida, estamos aqui!' },
  { category: 'NPS', name: 'NPS', text: '{{nome}}, de 0 a 10, quanto recomendaria a {{clinica}} para um amigo? Sua opiniao e muito importante para nos.' },
];

export default function WhatsApp() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border border-border overflow-hidden">
      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold">WhatsApp nao conectado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Para usar o WhatsApp, e necessario integrar a Evolution API e conectar o numero da clinica via QR Code.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="h-4 w-4 text-destructive" />
            <span>API nao configurada</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            Ver Templates de Mensagem
          </Button>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Templates de Mensagem</DialogTitle></DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {Array.from(new Set(TEMPLATES.map(t => t.category))).map(category => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{category}</p>
                  <div className="space-y-1.5">
                    {TEMPLATES.filter(t => t.category === category).map((t, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
