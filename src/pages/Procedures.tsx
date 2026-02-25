import { useState } from "react";
import { Plus, Search, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Procedures() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalogo de Procedimentos</h1>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Procedimento</Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar procedimento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-16 text-center">
          <Scissors className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhum procedimento cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground/70">Cadastre os procedimentos oferecidos pela clinica.</p>
        </CardContent>
      </Card>
    </div>
  );
}
