import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Automations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automacoes e Cadencias</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure sequencias automaticas de comunicacao com seus pacientes</p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma automacao configurada</p>
          <p className="mt-1 text-sm text-muted-foreground/70">As cadencias de mensagens serão configuradas quando a API do WhatsApp for integrada.</p>
        </CardContent>
      </Card>
    </div>
  );
}
