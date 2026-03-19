import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Brazilian first/last names for realistic data
const firstNames = [
  "Ana", "Maria", "João", "Pedro", "Lucas", "Juliana", "Fernanda", "Carlos", "Rafael", "Beatriz",
  "Mariana", "Bruno", "Gabriela", "Thiago", "Larissa", "Diego", "Camila", "Felipe", "Amanda", "Rodrigo",
  "Letícia", "Gustavo", "Isabela", "Matheus", "Natália", "André", "Priscila", "Daniel", "Vanessa", "Marcelo",
  "Patrícia", "Eduardo", "Renata", "Vinícius", "Tatiana", "Leonardo", "Aline", "Henrique", "Débora", "Caio",
  "Bruna", "Alexandre", "Carla", "Guilherme", "Michele", "Ricardo", "Jéssica", "Fábio", "Sandra", "Leandro",
];
const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Araújo", "Melo", "Barbosa", "Rocha", "Nascimento", "Cardoso",
  "Monteiro", "Moreira", "Nunes", "Mendes", "Barros", "Freitas", "Medeiros", "Teixeira", "Vieira", "Campos",
];
const sources = ["instagram", "google", "indicacao", "facebook", "site", "whatsapp"];
const stages = ["lead", "contacted", "scheduled", "in_treatment", "lost"];
const stageWeights = [0.30, 0.25, 0.20, 0.15, 0.10]; // most stay as lead/contacted
const appointmentStatuses = ["agendado", "confirmado"];
const ddds = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "27", "48", "47", "19", "15", "62"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items: string[], weights: number[]): string {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < items.length; i++) {
    cum += weights[i];
    if (r <= cum) return items[i];
  }
  return items[items.length - 1];
}

function randomPhone(ddd: string): string {
  const n = Math.floor(Math.random() * 900000000 + 100000000);
  return `(${ddd}) 9${n.toString().slice(0, 4)}-${n.toString().slice(4, 8)}`;
}

function randomEmail(first: string, last: string): string {
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br", "icloud.com"];
  const clean = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${clean(first)}.${clean(last)}${Math.floor(Math.random() * 99)}@${pick(domains)}`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function futureDate(maxDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * maxDays) + 1);
  return d.toISOString().split("T")[0];
}

function randomTime(): string {
  const hours = 8 + Math.floor(Math.random() * 10); // 08-17
  const mins = pick(["00", "15", "30", "45"]);
  return `${hours.toString().padStart(2, "0")}:${mins}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all active clinics
    const { data: clinics, error: clinicsErr } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("status", "ativa");

    if (clinicsErr) throw clinicsErr;
    if (!clinics || clinics.length === 0) {
      return new Response(JSON.stringify({ message: "No active clinics found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get procedures per clinic for appointments
    const { data: allProcedures } = await supabase
      .from("procedures")
      .select("id, clinic_id, name, duration_minutes")
      .eq("active", true);

    const procsByClinic: Record<string, any[]> = {};
    for (const p of (allProcedures || [])) {
      if (!procsByClinic[p.clinic_id]) procsByClinic[p.clinic_id] = [];
      procsByClinic[p.clinic_id].push(p);
    }

    // Get professional names from recent appointments per clinic
    const { data: recentAppts } = await supabase
      .from("appointments")
      .select("clinic_id, professional_name")
      .not("professional_name", "is", null)
      .limit(500);

    const profsByClinic: Record<string, string[]> = {};
    for (const a of (recentAppts || [])) {
      if (!profsByClinic[a.clinic_id]) profsByClinic[a.clinic_id] = [];
      if (a.professional_name && !profsByClinic[a.clinic_id].includes(a.professional_name)) {
        profsByClinic[a.clinic_id].push(a.professional_name);
      }
    }

    let totalLeads = 0;
    let totalAppointments = 0;

    for (const clinic of clinics) {
      const clinicId = clinic.id;
      const ddd = pick(ddds);

      // Generate 2-6 new leads per clinic per day
      const numLeads = 2 + Math.floor(Math.random() * 5);
      const newPatients: any[] = [];

      for (let i = 0; i < numLeads; i++) {
        const first = pick(firstNames);
        const last = pick(lastNames);
        const stage = weightedPick(stages, stageWeights);
        newPatients.push({
          clinic_id: clinicId,
          name: `${first} ${last}`,
          phone: randomPhone(ddd),
          email: randomEmail(first, last),
          source: pick(sources),
          stage,
          created_at: new Date().toISOString(),
        });
      }

      const { data: insertedPatients, error: pErr } = await supabase
        .from("patients")
        .insert(newPatients)
        .select("id, stage");

      if (pErr) {
        console.error(`Error inserting patients for clinic ${clinicId}:`, pErr.message);
        continue;
      }

      totalLeads += (insertedPatients || []).length;

      // Generate 1-4 appointments for patients who are scheduled/in_treatment
      const schedulablePatients = (insertedPatients || []).filter(
        (p) => p.stage === "scheduled" || p.stage === "in_treatment" || p.stage === "contacted"
      );

      // Also grab some existing patients for appointments
      const { data: existingPatients } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId)
        .in("stage", ["scheduled", "in_treatment", "contacted", "lead"])
        .limit(10);

      const allSchedulable = [...schedulablePatients, ...(existingPatients || [])];
      const numAppts = Math.min(1 + Math.floor(Math.random() * 4), allSchedulable.length);
      const procs = procsByClinic[clinicId] || [];
      const profs = profsByClinic[clinicId] || ["Dr(a). Responsável"];

      for (let i = 0; i < numAppts; i++) {
        const patient = allSchedulable[i];
        const proc = procs.length > 0 ? pick(procs) : null;
        const apptDate = futureDate(30); // next 30 days

        const { error: aErr } = await supabase.from("appointments").insert({
          clinic_id: clinicId,
          patient_id: patient.id,
          date: apptDate,
          time: randomTime(),
          status: pick(appointmentStatuses),
          professional_name: pick(profs),
          procedure_id: proc?.id || null,
          duration_minutes: proc?.duration_minutes || 60,
          notes: null,
        });

        if (!aErr) totalAppointments++;
      }
    }

    const summary = {
      message: "Auto-populate completed",
      date: todayStr(),
      clinics_processed: clinics.length,
      leads_created: totalLeads,
      appointments_created: totalAppointments,
    };

    console.log("Auto-populate summary:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-populate-crm error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
