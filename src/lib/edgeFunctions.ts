import { supabase } from "@/integrations/supabase/client";

type InvokeOptions = {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

/**
 * Typed wrapper around supabase.functions.invoke with session bearer attached.
 */
export async function invokeEdgeFunction<T = unknown>(
  name: string,
  options: InvokeOptions = {},
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const headers: Record<string, string> = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { data, error } = await supabase.functions.invoke<T>(name, {
    body: options.body,
    headers,
  });

  if (error) throw error;
  return data;
}
