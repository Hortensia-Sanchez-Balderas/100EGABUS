import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-51f7d672/health", (c) => {
  return c.json({ status: "ok" });
});

// Create user endpoint
app.post("/make-server-51f7d672/create-user", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre_completo, rol, activo } = body;

    if (!email || !password || !nombre_completo) {
      return c.json({ error: "Missing required fields: email, password, nombre_completo" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { nombre_completo },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user in auth:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "User creation failed" }, 500);
    }

    // Insert user record into usuarios table
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: data.user.id,
        email: email,
        nombre_completo: nombre_completo,
        rol: rol || 'operador',
        activo: activo !== undefined ? activo : true,
        fecha_creacion: new Date().toISOString(),
        ultimo_acceso: null,
      });

    if (dbError) {
      console.log('Error inserting user into database:', dbError);
      // Try to delete the auth user if database insert failed
      await supabase.auth.admin.deleteUser(data.user.id);
      return c.json({ error: `Database error: ${dbError.message}` }, 500);
    }

    return c.json({ success: true, user: data.user }, 201);
  } catch (error) {
    console.log('Error in create-user endpoint:', error);
    return c.json({ error: (error as Error).message }, 500);
  }
});

Deno.serve(app.fetch);