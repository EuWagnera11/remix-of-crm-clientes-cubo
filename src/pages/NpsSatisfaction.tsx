import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, Minus, ThumbsDown, Star, TrendingUp, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const npsOverTime = [
  { month: "Set", score: 62 }, { month: "Out", score: 68 }, { month: "Nov", score: 65 },
  { month: "Dez", score: 72 }, { month: "Jan", score: 70 }, { month: "Fev", score: 75 },
];

const npsDistribution = [
  { name: "Promotores (9-10)", value: 58, color: "#22C55E" },
  { name: "Neutros (7-8)", value: 25, color: "#FBBF24" },
  { name: "Detratores (0-6)", value: 17, color: "#EF4444" },
];

const recentNPS = [
  { id: "1", patient: "Ana Carolina Silva", score: 10, comment: "Excelente atendimento!", date: "2026-02-22", type: "promotor" },
  { id: "2", patient: "Fernando Gomes", score: 8, comment: "Bom, mas a espera foi longa.", date: "2026-02-20", type: "neutro" },
  { id: "3", patient: "Patricia Lima Oliveira", score: 10, comment: "Sempre impecavel!", date: "2026-02-18", type: "promotor" },
  { id: "4", patient: "Mariana Rocha", score: 5, comment: "Fiquei insatisfeita com o resultado.", date: "2026-02-15", type: "detrator" },
  { id: "5", patient: "Juliana Ferreira Santos", score: 9, comment: "Muito profissional.", date: "2026-02-14", type: "promotor" },
];

const googleReviews = [
  { id: "1", author: "Maria S.", rating: 5, text: "Clinica maravilhosa! Super recomendo.", date: "2026-02-21", replied: true },
  { id: "2", author: "Joao P.", rating: 4, text: "Bom atendimento, preco um pouco alto.", date: "2026-02-18", replied: true },
  { id: "3", author: "Fernanda L.", rating: 2, text: "Esperei mais de 40 minutos.", date: "2026-02-15", replied: false },
  { id: "4", author: "Carlos M.", rating: 5, text: "Procedimento perfeito, voltarei!", date: "2026-02-12", replied: true },
  { id: "5", author: "Lucia A.", rating: 5, text: "Melhor clinica da regiao.", date: "2026-02-10", replied: true },
];

const ratingOverTime = [
  { month: "Set", rating: 4.5 }, { month: "Out", rating: 4.6 }, { month: "Nov", rating: 4.4 },
  { month: "Dez", rating: 4.7 }, { month: "Jan", rating: 4.6 }, { month: "Fev", rating: 4.7 },
];

const npsScore = 75;
const googleAvg = 4.7;

const NpsIcon = ({ type }: { type: string }) => {
  if (type === "promotor") return <ThumbsUp className="h-4 w-4 text-success" />;
  if (type === "neutro") return <Minus className="h-4 w-4 text-warning" />;
  return <ThumbsDown className="h-4 w-4 text-destructive" />;
};

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`h-3.5 w-3.5 ${i < count ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
  ))}</div>
);

export default function NpsSatisfaction() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NPS e Satisfacao</h1>

      <Tabs defaultValue="nps">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="nps">NPS</TabsTrigger>
          <TabsTrigger value="reputation">Reputacao Google</TabsTrigger>
        </TabsList>

        {/* NPS */}
        <TabsContent value="nps" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card><CardContent className="flex flex-col items-center justify-center pt-6">
              <p className="text-sm text-muted-foreground">NPS Atual</p>
              <p className={`text-5xl font-bold ${npsScore >= 70 ? "text-success" : npsScore >= 50 ? "text-warning" : "text-destructive"}`}>{npsScore}</p>
              <p className="mt-1 text-xs text-muted-foreground">Zona de Excelencia</p>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Distribuicao</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={npsDistribution} dataKey="value" innerRadius={40} outerRadius={65}>
                  {npsDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} /></PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">{npsDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />{d.value}%</div>
              ))}</div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Evolucao NPS</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={npsOverTime}><XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle className="text-sm">Feedbacks Recentes</CardTitle></CardHeader><CardContent>
            <div className="space-y-3">{recentNPS.map(r => (
              <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <NpsIcon type={r.type} />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm">{r.patient}</span>
                    <Badge variant="outline" className={r.type === "promotor" ? "border-success/20 text-success" : r.type === "neutro" ? "border-warning/20 text-warning" : "border-destructive/20 text-destructive"}>{r.score}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              </div>
            ))}</div>
          </CardContent></Card>
        </TabsContent>

        {/* REPUTATION */}
        <TabsContent value="reputation" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card><CardContent className="flex flex-col items-center justify-center pt-6">
              <p className="text-sm text-muted-foreground">Nota Media Google</p>
              <div className="flex items-center gap-2"><p className="text-5xl font-bold text-warning">{googleAvg}</p><Star className="h-8 w-8 fill-warning text-warning" /></div>
              <p className="mt-1 text-xs text-muted-foreground">234 avaliacoes</p>
            </CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><CardTitle className="text-sm">Evolucao da Nota</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={ratingOverTime}><XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis domain={[3, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="rating" stroke="#FBBF24" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle className="text-sm">Avaliacoes Recentes</CardTitle></CardHeader><CardContent>
            <div className="space-y-3">{googleReviews.map(r => (
              <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">{r.author.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm">{r.author}</span><Stars count={r.rating} />
                    <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                    {r.replied && <Badge variant="outline" className="text-xs border-success/20 text-success">Respondida</Badge>}
                    {!r.replied && r.rating < 4 && <Badge variant="outline" className="text-xs border-destructive/20 text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />Pendente</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                </div>
              </div>
            ))}</div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
