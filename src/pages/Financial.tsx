import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Financial() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Faturamento do Mes</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">A Receber</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Em Atraso</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Ticket Medio</p><p className="text-2xl font-bold text-muted-foreground">—</p></CardContent></Card>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma movimentacao financeira</p>
          <p className="mt-1 text-sm text-muted-foreground/70">As cobrancas aparecerão aqui conforme orcamentos forem aprovados.</p>
        </CardContent>
      </Card>
    </div>
  );
}
