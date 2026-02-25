import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Check if caller is platform_admin
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "platform_admin");
    
    if (!callerRoles?.length) throw new Error("Only platform admins can manage team members");

    const { action, ...params } = await req.json();

    if (action === "list") {
      const { clinic_id } = params;
      if (!clinic_id) throw new Error("clinic_id required");

      // Get user_roles for this clinic
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("id, user_id, role")
        .eq("clinic_id", clinic_id);

      if (!roles?.length) {
        return new Response(JSON.stringify({ users: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user details from auth
      const userIds = [...new Set(roles.map(r => r.user_id))];
      const users = [];
      for (const uid of userIds) {
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (authUser) {
          const userRoles = roles.filter(r => r.user_id === uid);
          users.push({
            id: uid,
            email: authUser.email,
            role: userRoles[0]?.role,
            role_id: userRoles[0]?.id,
            created_at: authUser.created_at,
          });
        }
      }

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const { email, password, role, clinic_id } = params;
      if (!email || !password || !role || !clinic_id) throw new Error("email, password, role, clinic_id required");

      // Create auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) throw createError;

      // Assign role
      const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
        user_id: newUser.user.id,
        role,
        clinic_id,
      });
      if (roleError) throw roleError;

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      const { role_id, new_role } = params;
      if (!role_id || !new_role) throw new Error("role_id, new_role required");

      const { error } = await supabaseAdmin.from("user_roles").update({ role: new_role }).eq("id", role_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { user_id, role_id } = params;
      if (!role_id) throw new Error("role_id required");

      // Delete role
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("id", role_id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
