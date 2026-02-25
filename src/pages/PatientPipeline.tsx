import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function PatientPipeline() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pipeline de Pacientes</h1>
      <Card>
        <CardContent className="py-16 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum paciente no pipeline</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Os pacientes aparecerão aqui conforme forem registrados.</p>
        </CardContent>
      </Card>
    </div>
  );
}
