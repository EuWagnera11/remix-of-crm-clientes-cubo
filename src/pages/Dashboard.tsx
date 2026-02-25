import {
  Users,
  CalendarCheck,
  FileText,
  DollarSign,
  Percent,
  Clock,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  title, value, icon: Icon,
}: {
  title: string; value: string; icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visao geral da sua clinica</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Leads este mes" value="—" icon={Users} />
        <StatCard title="Agendamentos" value="—" icon={CalendarCheck} />
        <StatCard title="Orcamentos" value="—" icon={FileText} />
        <StatCard title="Faturamento" value="—" icon={DollarSign} />
        <StatCard title="Conversao" value="—" icon={Percent} />
        <StatCard title="Resp. media" value="—" icon={Clock} />
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="py-16 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum dado disponivel ainda</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Os dados aparecerão aqui conforme leads, agendamentos e orcamentos forem registrados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
