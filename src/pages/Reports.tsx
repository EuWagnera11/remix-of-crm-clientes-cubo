import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatorios</h1>
      <Card>
        <CardContent className="py-16 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum dado para relatorio</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Os relatorios serao gerados automaticamente conforme dados forem registrados no sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
}
