import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { mockTeam, mockPatients, mockProcedures } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ViewMode = 'day' | 'week' | 'month';
type AppointmentType = 'avaliacao' | 'procedimento' | 'retorno' | 'emergencia' | 'bloqueio';
type AppointmentStatus = 'agendado' | 'confirmado' | 'checkin' | 'em_atendimento' | 'finalizado' | 'no_show' | 'cancelado';

interface Appointment {
  id: string;
  patient_name: string;
  patient_id?: string;
  type: AppointmentType;
  procedure?: string;
  professional: string;
  date: string;
  start_hour: number;
  duration_minutes: number;
  room?: string;
  notes?: string;
  status: AppointmentStatus;
  send_whatsapp: boolean;
}

const TYPE_COLORS: Record<AppointmentType, string> = {
  avaliacao: '#3B82F6',
  procedimento: '#A855F7',
  retorno: '#22C55E',
  emergencia: '#EF4444',
  bloqueio: '#6B7280',
};

const TYPE_LABELS: Record<AppointmentType, string> = {
  avaliacao: 'Avaliacao',
  procedimento: 'Procedimento',
  retorno: 'Retorno',
  emergencia: 'Emergencia',
  bloqueio: 'Bloqueio',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  checkin: 'Check-in',
  em_atendimento: 'Em atendimento',
  finalizado: 'Finalizado',
  no_show: 'Nao compareceu',
  cancelado: 'Cancelado',
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7h-18h

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const mockAppointments: Appointment[] = [
  { id: '1', patient_name: 'Ana Carolina Silva', patient_id: '1', type: 'procedimento', procedure: 'Botox', professional: 'Dra. Marina Costa', date: todayStr, start_hour: 9, duration_minutes: 30, status: 'confirmado', send_whatsapp: true },
  { id: '2', patient_name: 'Fernando Gomes', patient_id: '6', type: 'avaliacao', professional: 'Dr. Ricardo Nunes', date: todayStr, start_hour: 10, duration_minutes: 60, status: 'agendado', send_whatsapp: true },
  { id: '3', patient_name: 'Patricia Lima Oliveira', patient_id: '5', type: 'procedimento', procedure: 'Skinbooster', professional: 'Dra. Marina Costa', date: todayStr, start_hour: 11, duration_minutes: 45, status: 'checkin', send_whatsapp: false },
  { id: '4', patient_name: 'Juliana Ferreira Santos', patient_id: '3', type: 'retorno', professional: 'Dra. Marina Costa', date: todayStr, start_hour: 14, duration_minutes: 30, status: 'agendado', send_whatsapp: true },
  { id: '5', patient_name: '', type: 'bloqueio', professional: 'Dr. Ricardo Nunes', date: todayStr, start_hour: 12, duration_minutes: 60, notes: 'Almoco', status: 'agendado', send_whatsapp: false },
  { id: '6', patient_name: 'Carlos Eduardo Mendes', patient_id: '2', type: 'avaliacao', professional: 'Dr. Ricardo Nunes', date: todayStr, start_hour: 14, duration_minutes: 60, status: 'no_show', send_whatsapp: true },
  { id: '7', patient_name: 'Lucas Ribeiro', patient_id: '8', type: 'procedimento', procedure: 'Lente de Contato Dental', professional: 'Dr. Ricardo Nunes', date: todayStr, start_hour: 15, duration_minutes: 120, status: 'agendado', send_whatsapp: true },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function getDayOffset(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d;
}

export default function Agenda() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showNew, setShowNew] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [viewByProfessional, setViewByProfessional] = useState(true);

  const professionals = mockTeam.filter((m) => m.role === 'clinic_staff' && m.active);
  const dateStr = currentDate.toISOString().split('T')[0];

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const dayAppointments = appointments.filter((a) => a.date === dateStr);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    setSelectedAppt(null);
  };

  const getStatusStyle = (appt: Appointment) => {
    const base = TYPE_COLORS[appt.type];
    switch (appt.status) {
      case 'confirmado': return { borderColor: '#22C55E', borderWidth: 2 };
      case 'checkin': return { backgroundColor: `${base}15`, borderColor: base };
      case 'em_atendimento': return { backgroundColor: `${base}20`, borderColor: base, animation: 'pulse 2s infinite' };
      case 'finalizado': return { opacity: 0.5, borderColor: base };
      case 'no_show': return { borderColor: '#EF4444', borderWidth: 2 };
      case 'cancelado': return { opacity: 0.4, textDecoration: 'line-through', borderColor: '#6B7280' };
      default: return { borderColor: base };
    }
  };

  // Week view data
  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => getDayOffset(start, i));
  }, [currentDate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-3">
          {viewMode === 'day' && (
            <button
              onClick={() => setViewByProfessional(!viewByProfessional)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {viewByProfessional ? 'Vista geral' : 'Por profissional'}
            </button>
          )}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={cn("px-3 py-1.5 text-xs transition-colors", viewMode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}
              >
                {m === 'day' ? 'Dia' : m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium min-w-[160px] text-center">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="gap-2" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Novo Agendamento</Button>
        </div>
      </div>

      {/* Type Legend */}
      <div className="flex gap-4">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[key as AppointmentType] }} />
            {label}
          </div>
        ))}
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <Card className="bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 shrink-0 border-r border-border">
                <div className="h-10 border-b border-border" />
                {HOURS.map((h) => (
                  <div key={h} className="flex h-16 items-start justify-end border-b border-border pr-2 pt-1">
                    <span className="text-[10px] text-muted-foreground">{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>

              {/* Professional columns or single column */}
              {viewByProfessional ? (
                professionals.map((prof) => {
                  const profAppts = dayAppointments.filter((a) => a.professional === prof.name);
                  return (
                    <div key={prof.id} className="flex-1 min-w-[200px] border-r border-border last:border-r-0">
                      <div className="flex h-10 items-center justify-center border-b border-border text-xs font-medium">
                        {prof.name}
                      </div>
                      <div className="relative">
                        {HOURS.map((h) => (
                          <div key={h} className="h-16 border-b border-border" />
                        ))}
                        {profAppts.map((appt) => {
                          const top = (appt.start_hour - 7) * 64;
                          const height = (appt.duration_minutes / 60) * 64;
                          const style = getStatusStyle(appt);
                          return (
                            <button
                              key={appt.id}
                              onClick={() => setSelectedAppt(appt)}
                              className="absolute left-1 right-1 rounded-md border-l-[3px] px-2 py-1 text-left transition-colors hover:opacity-90"
                              style={{ top, height: Math.max(height, 28), ...style, borderLeftStyle: 'solid' }}
                            >
                              <p className="text-xs font-medium truncate">{appt.type === 'bloqueio' ? (appt.notes || 'Bloqueio') : appt.patient_name}</p>
                              {appt.procedure && <p className="text-[10px] text-muted-foreground truncate">{appt.procedure}</p>}
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{String(appt.start_hour).padStart(2, '0')}:00</span>
                                {appt.status === 'no_show' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1">
                  <div className="flex h-10 items-center justify-center border-b border-border text-xs font-medium">Todos</div>
                  <div className="relative">
                    {HOURS.map((h) => (<div key={h} className="h-16 border-b border-border" />))}
                    {dayAppointments.map((appt) => {
                      const top = (appt.start_hour - 7) * 64;
                      const height = (appt.duration_minutes / 60) * 64;
                      const style = getStatusStyle(appt);
                      return (
                        <button key={appt.id} onClick={() => setSelectedAppt(appt)}
                          className="absolute left-1 right-1 rounded-md border-l-[3px] px-2 py-1 text-left transition-colors hover:opacity-90"
                          style={{ top, height: Math.max(height, 28), ...style, borderLeftStyle: 'solid' }}>
                          <p className="text-xs font-medium truncate">{appt.type === 'bloqueio' ? (appt.notes || 'Bloqueio') : appt.patient_name}</p>
                          <span className="text-[10px] text-muted-foreground">{appt.professional}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card className="bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-16 shrink-0 border-r border-border">
                <div className="h-10 border-b border-border" />
                {HOURS.map((h) => (
                  <div key={h} className="flex h-14 items-start justify-end border-b border-border pr-2 pt-1">
                    <span className="text-[10px] text-muted-foreground">{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
              {weekDates.map((wd, di) => {
                const dayStr = wd.toISOString().split('T')[0];
                const dayAppts = appointments.filter((a) => a.date === dayStr);
                const isToday = dayStr === todayStr;
                return (
                  <div key={di} className="flex-1 min-w-[100px] border-r border-border last:border-r-0">
                    <div className={cn("flex h-10 flex-col items-center justify-center border-b border-border text-xs", isToday && "bg-primary/10")}>
                      <span className="text-muted-foreground">{WEEKDAYS[di]}</span>
                      <span className={cn("font-medium", isToday && "text-primary")}>{wd.getDate()}</span>
                    </div>
                    <div className="relative">
                      {HOURS.map((h) => (<div key={h} className="h-14 border-b border-border" />))}
                      {dayAppts.map((appt) => {
                        const top = (appt.start_hour - 7) * 56;
                        const height = (appt.duration_minutes / 60) * 56;
                        return (
                          <button key={appt.id} onClick={() => setSelectedAppt(appt)}
                            className="absolute left-0.5 right-0.5 rounded border-l-2 px-1 py-0.5 text-left"
                            style={{ top, height: Math.max(height, 22), borderColor: TYPE_COLORS[appt.type], backgroundColor: `${TYPE_COLORS[appt.type]}15`, borderLeftStyle: 'solid' }}>
                            <p className="text-[10px] font-medium truncate">{appt.type === 'bloqueio' ? 'Bloqueio' : appt.patient_name.split(' ')[0]}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-px">
              {WEEKDAYS.map((d) => (<div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>))}
              {(() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const cells: React.ReactNode[] = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="p-2" />);
                for (let d = 1; d <= daysInMonth; d++) {
                  const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const dayAppts = appointments.filter((a) => a.date === ds);
                  const isToday = ds === todayStr;
                  cells.push(
                    <div key={d} className={cn("min-h-[80px] rounded-lg border border-border p-1.5", isToday && "border-primary")}>
                      <span className={cn("text-xs", isToday ? "font-bold text-primary" : "text-muted-foreground")}>{d}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayAppts.slice(0, 3).map((a) => (
                          <div key={a.id} className="flex items-center gap-1 rounded px-1 py-0.5" style={{ backgroundColor: `${TYPE_COLORS[a.type]}15` }}>
                            <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[a.type] }} />
                            <span className="text-[10px] truncate">{a.type === 'bloqueio' ? 'Bloqueio' : a.patient_name.split(' ')[0]}</span>
                          </div>
                        ))}
                        {dayAppts.length > 3 && <span className="text-[10px] text-muted-foreground pl-1">+{dayAppts.length - 3}</span>}
                      </div>
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppt} onOpenChange={() => setSelectedAppt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Paciente</span><span className="font-medium">{selectedAppt.patient_name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><Badge style={{ backgroundColor: TYPE_COLORS[selectedAppt.type] }} className="text-xs text-white">{TYPE_LABELS[selectedAppt.type]}</Badge></div>
                {selectedAppt.procedure && <div className="flex justify-between"><span className="text-muted-foreground">Procedimento</span><span>{selectedAppt.procedure}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Profissional</span><span>{selectedAppt.professional}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horario</span><span>{String(selectedAppt.start_hour).padStart(2, '0')}:00 ({selectedAppt.duration_minutes}min)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{STATUS_LABELS[selectedAppt.status]}</span></div>
              </div>
              {selectedAppt.type !== 'bloqueio' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Alterar status:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['agendado', 'confirmado', 'checkin', 'em_atendimento', 'finalizado', 'no_show', 'cancelado'] as AppointmentStatus[]).map((s) => (
                      <Button
                        key={s}
                        variant={selectedAppt.status === s ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => updateStatus(selectedAppt.id, s)}
                      >
                        {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paciente</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Buscar paciente..." /></SelectTrigger>
                <SelectContent>
                  {mockPatients.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} - {p.phone}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Procedimento</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mockProcedures.filter(p => p.active).map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Profissional</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} - {p.specialty}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Data</Label><Input type="date" defaultValue={dateStr} /></div>
              <div><Label>Hora inicio</Label><Input type="time" defaultValue="09:00" /></div>
              <div><Label>Duracao (min)</Label><Input type="number" defaultValue={30} /></div>
            </div>
            <div><Label>Sala/Consultorio</Label><Input placeholder="Ex: Sala 1" /></div>
            <div><Label>Observacoes</Label><Textarea placeholder="Notas sobre o agendamento..." /></div>
            <div className="flex items-center gap-2">
              <Checkbox id="send_whatsapp" defaultChecked />
              <label htmlFor="send_whatsapp" className="text-sm">Enviar confirmacao por WhatsApp</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={() => setShowNew(false)}>Criar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
