import { useState, useRef, useEffect } from "react";
import { Search, Paperclip, Send, Zap, Phone, CalendarPlus, FileText, ExternalLink, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { mockPatients } from "@/lib/mock-data";

interface Conversation {
  id: string;
  patient_id: string | null;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isPatient: boolean;
  status: 'lead' | 'paciente';
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document';
}

const TEMPLATES = [
  { category: 'Atendimento', name: 'Boas-vindas', text: 'Ola, {{nome}}! Seja bem-vindo(a) a {{clinica}}. Sou {{atendente}}, como posso ajuda-lo(a)?' },
  { category: 'Atendimento', name: 'Solicitar dados', text: '{{nome}}, para darmos andamento, preciso de algumas informacoes. Pode me informar seu nome completo e data de nascimento?' },
  { category: 'Agenda', name: 'Confirmacao D-1', text: '{{nome}}, lembrando da sua consulta amanha ({{data}}) as {{horario}} com {{profissional}}. Confirma sua presenca? Responda SIM ou NAO.' },
  { category: 'Agenda', name: 'Lembrete 2h', text: '{{nome}}, sua consulta e daqui a 2 horas, as {{horario}}. Estamos aguardando voce!' },
  { category: 'Agenda', name: 'Resgate no-show', text: '{{nome}}, sentimos sua falta hoje! Quer remarcar sua consulta? Temos horarios disponiveis essa semana.' },
  { category: 'Agenda', name: 'Remarcar', text: '{{nome}}, precisamos remarcar sua consulta. Os horarios disponiveis sao: {{horarios}}. Qual prefere?' },
  { category: 'Orcamento', name: 'Envio de orcamento', text: '{{nome}}, segue o orcamento do(s) procedimento(s) que conversamos. Qualquer duvida, estou a disposicao.' },
  { category: 'Orcamento', name: 'Follow-up D+3', text: '{{nome}}, gostaria de saber se conseguiu analisar o orcamento que enviei. Posso esclarecer alguma duvida?' },
  { category: 'Orcamento', name: 'Orcamento expirando', text: '{{nome}}, o orcamento que enviei tem validade ate {{data_validade}}. Quer aproveitar as condicoes?' },
  { category: 'Pos-procedimento', name: 'Pos-procedimento', text: '{{nome}}, como esta se sentindo apos o procedimento? Lembre-se de seguir as orientacoes que passamos. Qualquer duvida, estamos aqui!' },
  { category: 'Pos-procedimento', name: 'Retorno', text: '{{nome}}, esta na hora de agendar seu retorno! Posso verificar os horarios disponiveis?' },
  { category: 'Reativacao', name: 'Inativo 30 dias', text: '{{nome}}, faz tempo que nao nos vemos! Que tal agendar uma avaliacao? Temos novidades que podem te interessar.' },
  { category: 'Reativacao', name: 'Inativo 90 dias', text: '{{nome}}, sentimos sua falta! Temos condicoes especiais este mes para procedimentos de {{categoria}}. Quer saber mais?' },
  { category: 'NPS', name: 'NPS', text: '{{nome}}, de 0 a 10, quanto recomendaria a {{clinica}} para um amigo? Sua opiniao e muito importante para nos.' },
];

const mockConversations: Conversation[] = [
  { id: '1', patient_id: '1', name: 'Ana Carolina Silva', phone: '(11) 99876-5432', lastMessage: 'Oi! Gostaria de agendar meu retorno', lastMessageTime: '10:32', unread: 2, isPatient: true, status: 'paciente' },
  { id: '2', patient_id: '2', name: 'Carlos Eduardo Mendes', phone: '(11) 98765-4321', lastMessage: 'Qual o valor da lente?', lastMessageTime: '09:45', unread: 1, isPatient: true, status: 'lead' },
  { id: '3', patient_id: '3', name: 'Juliana Ferreira Santos', phone: '(11) 97654-3210', lastMessage: 'Obrigada! Vou seguir as orientacoes', lastMessageTime: 'Ontem', unread: 0, isPatient: true, status: 'paciente' },
  { id: '4', patient_id: null, name: '(11) 91234-5678', phone: '(11) 91234-5678', lastMessage: 'Ola, gostaria de informacoes sobre harmonizacao', lastMessageTime: '08:15', unread: 1, isPatient: false, status: 'lead' },
  { id: '5', patient_id: '5', name: 'Patricia Lima Oliveira', phone: '(11) 95432-1098', lastMessage: 'Confirmado! Ate amanha', lastMessageTime: 'Ontem', unread: 0, isPatient: true, status: 'paciente' },
  { id: '6', patient_id: '4', name: 'Roberto Almeida', phone: '(11) 96543-2109', lastMessage: 'Vou pensar e te retorno', lastMessageTime: 'Seg', unread: 0, isPatient: true, status: 'lead' },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Ola Ana! Tudo bem?', sent: true, time: '10:15', status: 'read', type: 'text' },
    { id: '2', text: 'Oi! Tudo otimo! Gostaria de agendar meu retorno de Botox', sent: false, time: '10:28', status: 'read', type: 'text' },
    { id: '3', text: 'Claro! Temos horarios disponiveis na proxima semana. Prefere terca ou quinta?', sent: true, time: '10:30', status: 'delivered', type: 'text' },
    { id: '4', text: 'Oi! Gostaria de agendar meu retorno', sent: false, time: '10:32', status: 'read', type: 'text' },
  ],
  '2': [
    { id: '5', text: 'Ola Carlos! Seja bem-vindo a Clinica Exemplo. Sou Camila, como posso ajuda-lo?', sent: true, time: '09:30', status: 'read', type: 'text' },
    { id: '6', text: 'Qual o valor da lente?', sent: false, time: '09:45', status: 'read', type: 'text' },
  ],
  '4': [
    { id: '7', text: 'Ola, gostaria de informacoes sobre harmonizacao', sent: false, time: '08:15', status: 'read', type: 'text' },
  ],
};

export default function WhatsApp() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread' | 'mine' | 'unassigned'>('all');
  const [selectedConv, setSelectedConv] = useState<string | null>('1');
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = mockConversations.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false;
    }
    if (filter === 'unread' && c.unread === 0) return false;
    return true;
  });

  const activeConv = mockConversations.find((c) => c.id === selectedConv);
  const activeMessages = selectedConv ? messages[selectedConv] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const sendMessage = () => {
    if (!inputText.trim() || !selectedConv) return;
    const newMsg: Message = {
      id: String(Date.now()),
      text: inputText,
      sent: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text',
    };
    setMessages((prev) => ({
      ...prev,
      [selectedConv]: [...(prev[selectedConv] || []), newMsg],
    }));
    setInputText("");
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    const patientName = activeConv?.name.split(' ')[0] || 'Paciente';
    const text = template.text
      .replace(/\{\{nome\}\}/g, patientName)
      .replace(/\{\{clinica\}\}/g, 'Clinica Exemplo')
      .replace(/\{\{atendente\}\}/g, 'Camila')
      .replace(/\{\{profissional\}\}/g, 'Dra. Marina')
      .replace(/\{\{data\}\}/g, '26/02/2026')
      .replace(/\{\{horario\}\}/g, '14:00')
      .replace(/\{\{data_validade\}\}/g, '05/03/2026')
      .replace(/\{\{categoria\}\}/g, 'Estetica Facial')
      .replace(/\{\{horarios\}\}/g, 'Terca 10h, Quinta 14h, Sexta 9h');
    setInputText(text);
    setShowTemplates(false);
  };

  const MessageStatus = ({ status }: { status: string }) => {
    if (status === 'sent') return <Check className="h-3 w-3 text-muted-foreground" />;
    if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    return <CheckCheck className="h-3 w-3 text-info" />;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border border-border overflow-hidden">
      {/* Conversation List */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex gap-1">
            {(['all', 'unread', 'mine', 'unassigned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'Nao lidas' : f === 'mine' ? 'Minhas' : 'Sem resp.'}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-accent",
                selectedConv === conv.id && "bg-accent"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {conv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{conv.name}</span>
                  {conv.isPatient && (
                    <Badge variant="outline" className={cn("text-[10px] shrink-0 px-1 py-0", conv.status === 'paciente' ? "border-success text-success" : "border-info text-info")}>
                      {conv.status === 'paciente' ? 'Paciente' : 'Novo Lead'}
                    </Badge>
                  )}
                  {!conv.isPatient && (
                    <Badge variant="outline" className="text-[10px] shrink-0 px-1 py-0 border-warning text-warning">Novo Lead</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{conv.lastMessageTime}</span>
                {conv.unread > 0 && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {activeConv ? (
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {activeConv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{activeConv.name}</p>
                  <Badge variant="outline" className={cn("text-[10px] px-1 py-0", activeConv.status === 'paciente' ? "border-success text-success" : "border-info text-info")}>
                    {activeConv.status === 'paciente' ? 'Paciente' : 'Lead'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activeConv.phone}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {activeConv.patient_id && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <ExternalLink className="h-3 w-3" /> Ver ficha
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <CalendarPlus className="h-3 w-3" /> Agendar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <FileText className="h-3 w-3" /> Orcamento
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-2 max-w-3xl mx-auto">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.sent ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2",
                    msg.sent ? "bg-primary/15 text-foreground" : "bg-accent text-foreground"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      {msg.sent && <MessageStatus status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border bg-card p-3">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowTemplates(true)}>
                <Zap className="h-4 w-4 text-primary" />
              </Button>
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Digite uma mensagem..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px] max-h-[120px]"
                  rows={1}
                />
              </div>
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={!inputText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Selecione uma conversa para comecar
        </div>
      )}

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
                      <button
                        key={i}
                        onClick={() => applyTemplate(t)}
                        className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                      >
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.text}</p>
                      </button>
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
