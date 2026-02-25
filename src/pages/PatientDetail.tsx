import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PatientDetail() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">Paciente não encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground/70">Nenhum dado disponível.</p>
      </CardContent>
    </Card>
  );
}
