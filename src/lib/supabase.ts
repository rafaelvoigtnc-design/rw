import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Cliente com service role key para operações de admin (bypass RLS)
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

// Funções helper para acessar as tabelas
export async function getAdminByEmail(email: string) {
  const { data, error } = await supabase
    .from('usuario_admin')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

export async function getClientByEmail(email: string) {
  const { data, error } = await supabase
    .from('cliente')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

export async function getClientByAuthId(authId: string) {
  const { data, error } = await supabase
    .from('cliente')
    .select('*')
    .eq('auth_id', authId)
    .single();
  
  if (error) return null;
  return data;
}

export async function createClientRecord(clientData: any) {
  const { data, error } = await supabase
    .from('cliente')
    .insert(clientData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function createAdminRecord(adminData: any) {
  const { data, error } = await supabase
    .from('usuario_admin')
    .insert(adminData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
