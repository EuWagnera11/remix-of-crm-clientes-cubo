import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { email, password, name } = await req.json();

  // 1. Create auth user
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const userId = userData.user.id;

  // 2. Create clinic
  const { data: clinic, error: clinicError } = await supabaseAdmin.from("clinics").insert({
    name: name || "Minha Clínica",
    owner_email: email,
    owner_name: email.split("@")[0],
  }).select("id").single();

  if (clinicError) {
    return new Response(JSON.stringify({ error: clinicError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // 3. Assign clinic_owner role
  await supabaseAdmin.from("user_roles").insert({
    user_id: userId,
    clinic_id: clinic.id,
    role: "clinic_owner",
  });

  return new Response(JSON.stringify({ success: true, userId, clinicId: clinic.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
