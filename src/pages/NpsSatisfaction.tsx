import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NpsSatisfaction() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NPS e Satisfacao</h1>
      <Card>
        <CardContent className="py-16 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma avaliacao recebida</p>
          <p className="mt-1 text-sm text-muted-foreground/70">As avaliacoes NPS e reviews aparecerão aqui conforme forem coletadas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
