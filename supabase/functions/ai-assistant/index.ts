import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "list_patients",
      description: "Lista pacientes da clínica. Pode filtrar por nome ou estágio.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Filtro por nome (opcional)" },
          stage: { type: "string", description: "Filtro por estágio: lead, agendado, em_tratamento, paciente_ativo, inativo, vip" },
          limit: { type: "number", description: "Máximo de resultados (padrão 10)" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_patient",
      description: "Cadastra um novo paciente/lead na clínica.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome completo do paciente" },
          phone: { type: "string", description: "Telefone com DDD" },
          email: { type: "string", description: "Email do paciente" },
          birth_date: { type: "string", description: "Data de nascimento YYYY-MM-DD" },
          cpf: { type: "string", description: "CPF do paciente" },
          gender: { type: "string", description: "Gênero: masculino, feminino, outro" },
          notes: { type: "string", description: "Observações" },
          source: { type: "string", description: "Origem: manual, whatsapp, instagram, facebook, google, indicacao, site" },
          stage: { type: "string", description: "Estágio: lead, agendado, em_tratamento, paciente_ativo, inativo, vip" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_patient_stage",
      description: "Move um paciente no pipeline (altera o estágio).",
      parameters: {
        type: "object",
        properties: {
          patient_id: { type: "string", description: "ID do paciente (UUID)" },
          patient_name: { type: "string", description: "Nome do paciente (usado para buscar se não tiver o ID)" },
          stage: { type: "string", enum: ["lead", "agendado", "em_tratamento", "paciente_ativo", "inativo", "vip"], description: "Novo estágio" },
        },
        required: ["stage"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_procedures",
      description: "Lista procedimentos disponíveis na clínica.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Filtro por nome" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_procedure",
      description: "Cria um novo procedimento no catálogo da clínica.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do procedimento" },
          price: { type: "number", description: "Preço em reais" },
          category: { type: "string", description: "Categoria do procedimento" },
          description: { type: "string", description: "Descrição do procedimento" },
          duration_minutes: { type: "number", description: "Duração em minutos (padrão 60)" },
        },
        required: ["name", "price"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_appointment",
      description: "Agenda uma consulta para um paciente.",
      parameters: {
        type: "object",
        properties: {
          patient_id: { type: "string", description: "ID do paciente" },
          patient_name: { type: "string", description: "Nome do paciente (usado para buscar se não tiver o ID)" },
          date: { type: "string", description: "Data da consulta YYYY-MM-DD" },
          time: { type: "string", description: "Horário HH:MM" },
          procedure_id: { type: "string", description: "ID do procedimento (opcional)" },
          procedure_name: { type: "string", description: "Nome do procedimento (usado para buscar se não tiver o ID)" },
          professional_name: { type: "string", description: "Nome do profissional" },
          duration_minutes: { type: "number", description: "Duração em minutos" },
          notes: { type: "string", description: "Observações" },
        },
        required: ["date", "time"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_appointments",
      description: "Lista agendamentos da clínica. Pode filtrar por data.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Data YYYY-MM-DD para filtrar" },
          status: { type: "string", description: "Status: agendado, confirmado, realizado, cancelado, faltou" },
          limit: { type: "number", description: "Máximo de resultados" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_appointment_status",
      description: "Atualiza o status de um agendamento.",
      parameters: {
        type: "object",
        properties: {
          appointment_id: { type: "string", description: "ID do agendamento" },
          status: { type: "string", enum: ["agendado", "confirmado", "realizado", "cancelado", "faltou"], description: "Novo status" },
        },
        required: ["appointment_id", "status"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_budget",
      description: "Cria um orçamento para um paciente.",
      parameters: {
        type: "object",
        properties: {
          patient_id: { type: "string", description: "ID do paciente" },
          patient_name: { type: "string", description: "Nome do paciente (busca se não tiver ID)" },
          items: {
            type: "array",
            description: "Itens do orçamento",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                unit_price: { type: "number" },
                quantity: { type: "number" },
                procedure_name: { type: "string", description: "Nome do procedimento para vincular" },
              },
              required: ["name", "unit_price"],
              additionalProperties: false,
            },
          },
          discount: { type: "number", description: "Desconto em reais" },
          installments: { type: "number", description: "Número de parcelas" },
          payment_method: { type: "string", description: "Método de pagamento" },
          notes: { type: "string" },
        },
        required: ["items"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_summary",
      description: "Retorna um resumo do dashboard: total de pacientes, agendamentos de hoje, receita do mês.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
];

async function executeTool(
  toolName: string,
  args: Record<string, any>,
  supabaseClient: any,
  clinicId: string
): Promise<string> {
  try {
    switch (toolName) {
      case "list_patients": {
        let query = supabaseClient.from("patients").select("id, name, phone, email, stage, source, created_at").eq("clinic_id", clinicId);
        if (args.search) query = query.ilike("name", `%${args.search}%`);
        if (args.stage) query = query.eq("stage", args.stage);
        query = query.order("created_at", { ascending: false }).limit(args.limit || 10);
        const { data, error } = await query;
        if (error) return `Erro: ${error.message}`;
        return JSON.stringify(data);
      }

      case "create_patient": {
        const { data, error } = await supabaseClient.from("patients").insert({
          clinic_id: clinicId,
          name: args.name,
          phone: args.phone || null,
          email: args.email || null,
          birth_date: args.birth_date || null,
          cpf: args.cpf || null,
          gender: args.gender || null,
          notes: args.notes || null,
          source: args.source || "manual",
          stage: args.stage || "lead",
        }).select().single();
        if (error) return `Erro ao cadastrar: ${error.message}`;
        return `Paciente "${data.name}" cadastrado com sucesso! ID: ${data.id}`;
      }

      case "update_patient_stage": {
        let patientId = args.patient_id;
        if (!patientId && args.patient_name) {
          const { data } = await supabaseClient.from("patients").select("id, name").eq("clinic_id", clinicId).ilike("name", `%${args.patient_name}%`).limit(1).single();
          if (!data) return `Paciente "${args.patient_name}" não encontrado.`;
          patientId = data.id;
        }
        if (!patientId) return "É necessário informar o ID ou nome do paciente.";
        const { error } = await supabaseClient.from("patients").update({ stage: args.stage }).eq("id", patientId).eq("clinic_id", clinicId);
        if (error) return `Erro: ${error.message}`;
        return `Paciente movido para estágio "${args.stage}" com sucesso!`;
      }

      case "list_procedures": {
        let query = supabaseClient.from("procedures").select("id, name, price, category, duration_minutes, active").eq("clinic_id", clinicId);
        if (args.search) query = query.ilike("name", `%${args.search}%`);
        const { data, error } = await query.order("name").limit(20);
        if (error) return `Erro: ${error.message}`;
        return JSON.stringify(data);
      }

      case "create_procedure": {
        const { data, error } = await supabaseClient.from("procedures").insert({
          clinic_id: clinicId,
          name: args.name,
          price: args.price,
          category: args.category || null,
          description: args.description || null,
          duration_minutes: args.duration_minutes || 60,
        }).select().single();
        if (error) return `Erro: ${error.message}`;
        return `Procedimento "${data.name}" criado! Preço: R$${data.price}`;
      }

      case "schedule_appointment": {
        let patientId = args.patient_id;
        if (!patientId && args.patient_name) {
          const { data } = await supabaseClient.from("patients").select("id").eq("clinic_id", clinicId).ilike("name", `%${args.patient_name}%`).limit(1).single();
          if (!data) return `Paciente "${args.patient_name}" não encontrado. Cadastre primeiro.`;
          patientId = data.id;
        }
        if (!patientId) return "É necessário informar o paciente.";

        let procedureId = args.procedure_id || null;
        if (!procedureId && args.procedure_name) {
          const { data } = await supabaseClient.from("procedures").select("id").eq("clinic_id", clinicId).ilike("name", `%${args.procedure_name}%`).limit(1).single();
          if (data) procedureId = data.id;
        }

        const { data, error } = await supabaseClient.from("appointments").insert({
          clinic_id: clinicId,
          patient_id: patientId,
          date: args.date,
          time: args.time,
          procedure_id: procedureId,
          professional_name: args.professional_name || null,
          duration_minutes: args.duration_minutes || 60,
          notes: args.notes || null,
          status: "agendado",
        }).select().single();
        if (error) return `Erro: ${error.message}`;
        return `Consulta agendada para ${args.date} às ${args.time}! ID: ${data.id}`;
      }

      case "list_appointments": {
        let query = supabaseClient.from("appointments").select("id, date, time, status, professional_name, notes, patients(name), procedures(name)").eq("clinic_id", clinicId);
        if (args.date) query = query.eq("date", args.date);
        if (args.status) query = query.eq("status", args.status);
        const { data, error } = await query.order("date", { ascending: false }).order("time").limit(args.limit || 10);
        if (error) return `Erro: ${error.message}`;
        return JSON.stringify(data);
      }

      case "update_appointment_status": {
        const { error } = await supabaseClient.from("appointments").update({ status: args.status }).eq("id", args.appointment_id).eq("clinic_id", clinicId);
        if (error) return `Erro: ${error.message}`;
        return `Status do agendamento atualizado para "${args.status}"!`;
      }

      case "create_budget": {
        let patientId = args.patient_id;
        if (!patientId && args.patient_name) {
          const { data } = await supabaseClient.from("patients").select("id").eq("clinic_id", clinicId).ilike("name", `%${args.patient_name}%`).limit(1).single();
          if (!data) return `Paciente "${args.patient_name}" não encontrado.`;
          patientId = data.id;
        }
        if (!patientId) return "É necessário informar o paciente.";

        const total = (args.items || []).reduce((sum: number, item: any) => sum + (item.unit_price * (item.quantity || 1)), 0);
        const { data: budget, error } = await supabaseClient.from("budgets").insert({
          clinic_id: clinicId,
          patient_id: patientId,
          total,
          discount: args.discount || 0,
          installments: args.installments || 1,
          payment_method: args.payment_method || null,
          notes: args.notes || null,
          status: "pendente",
        }).select().single();
        if (error) return `Erro: ${error.message}`;

        for (const item of (args.items || [])) {
          let procId = null;
          if (item.procedure_name) {
            const { data } = await supabaseClient.from("procedures").select("id").eq("clinic_id", clinicId).ilike("name", `%${item.procedure_name}%`).limit(1).single();
            if (data) procId = data.id;
          }
          await supabaseClient.from("budget_items").insert({
            budget_id: budget.id,
            name: item.name,
            unit_price: item.unit_price,
            quantity: item.quantity || 1,
            procedure_id: procId,
          });
        }
        return `Orçamento criado! Total: R$${total} | ID: ${budget.id}`;
      }

      case "get_dashboard_summary": {
        const today = new Date().toISOString().split("T")[0];
        const startOfMonth = today.substring(0, 7) + "-01";

        const [patientsRes, appointmentsRes, installmentsRes] = await Promise.all([
          supabaseClient.from("patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId),
          supabaseClient.from("appointments").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId).eq("date", today),
          supabaseClient.from("financial_installments").select("amount").eq("clinic_id", clinicId).eq("status", "pago").gte("paid_at", startOfMonth),
        ]);

        const revenue = (installmentsRes.data || []).reduce((sum: number, i: any) => sum + Number(i.amount), 0);
        return JSON.stringify({
          total_patients: patientsRes.count || 0,
          appointments_today: appointmentsRes.count || 0,
          monthly_revenue: revenue,
        });
      }

      default:
        return `Ferramenta "${toolName}" não reconhecida.`;
    }
  } catch (e) {
    return `Erro inesperado: ${e instanceof Error ? e.message : "desconhecido"}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, clinic_id } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Create supabase client with user's auth
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const systemPrompt = `Você é a assistente de IA do CRM odontológico. Seu nome é "Assistente CUBO".
Você ajuda a equipe da clínica a gerenciar pacientes, agendar consultas, criar procedimentos, orçamentos e mais.

Regras:
- Sempre responda em português brasileiro
- Seja concisa e objetiva
- Use as ferramentas disponíveis para realizar ações no sistema
- Se não tiver informação suficiente, pergunte ao usuário
- Ao listar dados, formate de forma legível com markdown
- Quando o usuário pedir para buscar um paciente por nome, use a ferramenta list_patients com o filtro search
- Quando o usuário quiser agendar consulta sem informar paciente, pergunte qual paciente
- Formate valores monetários como R$ X.XXX,XX
- Data de hoje: ${new Date().toISOString().split("T")[0]}`;

    let conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Loop for tool calling
    let maxIterations = 5;
    while (maxIterations > 0) {
      maxIterations--;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes para IA." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI error:", response.status, t);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      if (!message) throw new Error("No message in response");

      conversationMessages.push(message);

      // If model wants to call tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          const fnArgs = JSON.parse(toolCall.function.arguments || "{}");
          console.log(`Executing tool: ${fnName}`, fnArgs);

          const result = await executeTool(fnName, fnArgs, supabaseClient, clinic_id);
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }
        continue; // Let model process tool results
      }

      // Model returned final text
      return new Response(JSON.stringify({ content: message.content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: "Desculpe, não consegui processar sua solicitação. Tente novamente." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
