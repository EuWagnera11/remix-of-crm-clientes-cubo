import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockTeam, type TeamMember } from "@/lib/mock-data";
import { Plus, Edit2, Power, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ROLE_LABELS: Record<string, string> = {
  clinic_owner: "Proprietario",
  clinic_staff: "Profissional",
  clinic_receptionist: "Recepcionista",
};

export default function SettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);

  const toggleMember = (id: string) => {
    setTeam((prev) => prev.map((m) => m.id === id ? { ...m, active: !m.active } : m));
  };

  const openNewMember = () => {
    setEditMember({ id: String(Date.now()), name: "", email: "", role: "clinic_staff", active: true });
    setIsNewMember(true);
  };

  const saveMember = () => {
    if (!editMember) return;
    if (isNewMember) {
      setTeam((prev) => [...prev, editMember]);
    } else {
      setTeam((prev) => prev.map((m) => m.id === editMember.id ? editMember : m));
    }
    setEditMember(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      <Tabs defaultValue="clinic">
        <TabsList className="bg-accent">
          <TabsTrigger value="clinic">Dados da Clinica</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="integrations">Integracoes</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        </TabsList>

        {/* Clinic Data */}
        <TabsContent value="clinic" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Informacoes Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome da Clinica</Label><Input defaultValue="Clinica Exemplo Premium" /></div>
                <div><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
                <div><Label>Telefone</Label><Input defaultValue="(11) 3456-7890" /></div>
                <div><Label>E-mail</Label><Input defaultValue="contato@clinicaexemplo.com.br" /></div>
                <div><Label>Instagram</Label><Input defaultValue="@clinicaexemplo" /></div>
                <div><Label>Site</Label><Input defaultValue="https://clinicaexemplo.com.br" /></div>
              </div>
              <div><Label>Endereco</Label><Input defaultValue="Av. Paulista, 1000 - Bela Vista, Sao Paulo - SP, 01310-100" /></div>
              <div><Label>Especialidade Principal</Label>
                <Select defaultValue="estetica">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estetica">Estetica</SelectItem>
                    <SelectItem value="odonto">Odontologia</SelectItem>
                    <SelectItem value="dermatologia">Dermatologia</SelectItem>
                    <SelectItem value="hof">HOF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Salvar Alteracoes</Button>
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
                    <Input className="w-24" defaultValue={i < 5 ? "08:00" : i === 5 ? "09:00" : ""} disabled={i === 6} />
                    <span>ate</span>
                    <Input className="w-24" defaultValue={i < 5 ? "18:00" : i === 5 ? "13:00" : ""} disabled={i === 6} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={openNewMember}><UserPlus className="h-4 w-4" /> Adicionar Membro</Button>
          </div>
          <Card className="bg-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Funcao</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium text-sm">{m.name}</TableCell>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{ROLE_LABELS[m.role]}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.specialty || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={m.active ? "default" : "outline"} className={`text-xs ${m.active ? "bg-success text-success-foreground" : ""}`}>
                          {m.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditMember({ ...m }); setIsNewMember(false); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMember(m.id)}><Power className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>{isNewMember ? "Novo Membro" : "Editar Membro"}</DialogTitle></DialogHeader>
              {editMember && (
                <div className="space-y-4">
                  <div><Label>Nome</Label><Input value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} /></div>
                  <div><Label>E-mail</Label><Input value={editMember.email} onChange={(e) => setEditMember({ ...editMember, email: e.target.value })} /></div>
                  <div><Label>Funcao</Label>
                    <Select value={editMember.role} onValueChange={(v) => setEditMember({ ...editMember, role: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinic_staff">Profissional</SelectItem>
                        <SelectItem value="clinic_receptionist">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Especialidade</Label><Input value={editMember.specialty || ""} onChange={(e) => setEditMember({ ...editMember, specialty: e.target.value })} /></div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditMember(null)}>Cancelar</Button>
                <Button onClick={saveMember}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">WhatsApp (Evolution API)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm">Desconectado</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>URL da API</Label><Input placeholder="https://api.evolution..." /></div>
                <div><Label>API Key</Label><Input type="password" placeholder="Sua API key" /></div>
                <div><Label>Instancia</Label><Input placeholder="Nome da instancia" /></div>
              </div>
              <Button>Conectar WhatsApp</Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Google Calendar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">Nao configurado</span>
              </div>
              <div><Label>ID do Calendario</Label><Input placeholder="email@gmail.com" /></div>
              <Button variant="outline">Conectar Google Calendar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LGPD */}
        <TabsContent value="lgpd" className="mt-4 space-y-4">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Texto de Consentimento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={6}
                defaultValue="Ao fornecer seus dados, voce autoriza a Clinica Exemplo a utilizar suas informacoes para fins de agendamento, comunicacao sobre tratamentos e envio de novidades. Seus dados sao protegidos conforme a LGPD (Lei 13.709/2018). Voce pode solicitar acesso, correcao ou exclusao de seus dados a qualquer momento."
              />
              <Button>Salvar Texto</Button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader><CardTitle className="text-sm">Log de Consentimentos</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Nenhum registro de consentimento disponivel (conectar ao backend)
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
