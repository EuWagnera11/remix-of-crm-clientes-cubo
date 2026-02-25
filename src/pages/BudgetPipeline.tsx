import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function BudgetPipeline() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pipeline de Orcamentos</h1>
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum orcamento no pipeline</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Os orcamentos aparecerão aqui conforme forem criados.</p>
        </CardContent>
      </Card>
    </div>
  );
}
