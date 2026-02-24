import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell, MessageSquare, Calendar, FileText, DollarSign,
  Users, AlertTriangle, Star, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "whatsapp" | "appointment" | "budget" | "financial" | "lead" | "cadence" | "nps";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const ICONS: Record<string, typeof Bell> = {
  whatsapp: MessageSquare,
  appointment: Calendar,
  budget: FileText,
  financial: DollarSign,
  lead: Users,
  cadence: AlertTriangle,
  nps: Star,
};

const ICON_COLORS: Record<string, string> = {
  whatsapp: "text-success",
  appointment: "text-info",
  budget: "text-primary",
  financial: "text-warning",
  lead: "text-info",
  cadence: "text-warning",
  nps: "text-destructive",
};

const initialNotifications: Notification[] = [
  { id: "1", type: "whatsapp", title: "Nova mensagem", description: "Carlos Eduardo enviou uma mensagem", time: "2 min", read: false },
  { id: "2", type: "appointment", title: "Agendamento confirmado", description: "Ana Carolina confirmou consulta amanha", time: "15 min", read: false },
  { id: "3", type: "appointment", title: "No-show", description: "Roberto Almeida nao compareceu", time: "1h", read: false },
  { id: "4", type: "budget", title: "Orcamento aprovado", description: "Juliana aprovou orcamento de R$ 3.000", time: "2h", read: false },
  { id: "5", type: "financial", title: "Parcela atrasada", description: "Lucas Ribeiro - parcela de R$ 1.880 vencida", time: "3h", read: true },
  { id: "6", type: "lead", title: "Novo lead", description: "Novo contato via Instagram Ads", time: "4h", read: true },
  { id: "7", type: "nps", title: "Detrator NPS", description: "Mariana Rocha deu nota 5", time: "5h", read: true },
  { id: "8", type: "cadence", title: "Cadencia pendente", description: "Follow-up D+3 para 5 pacientes", time: "6h", read: true },
];

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notificacoes</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={markAllRead}>
              <Check className="mr-1 h-3 w-3" />Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map(n => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button key={n.id} onClick={() => markRead(n.id)}
                className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent", !n.read && "bg-primary/5")}>
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted", ICON_COLORS[n.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</span>
                    {!n.read && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
