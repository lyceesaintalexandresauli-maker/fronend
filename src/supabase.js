import { createClient } from "@supabase/supabase-js";

const readEnv = (value) => String(value || "").trim();

const projectRef = readEnv(import.meta.env.VITE_SUPABASE_PROJECT_REF);
const derivedUrl = projectRef ? `https://${projectRef}.supabase.co` : "";
const supabaseUrl = readEnv(import.meta.env.VITE_SUPABASE_URL) || derivedUrl;
const supabaseAnonKey = readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

let browserClient = null;

export const getSupabaseConfigError = () => {
  const issues = [];
  if (!supabaseUrl) {
    issues.push("VITE_SUPABASE_URL is missing");
  } else if (!/^https?:\/\//i.test(supabaseUrl)) {
    issues.push("VITE_SUPABASE_URL must be a full http(s) URL");
  }

  if (!supabaseAnonKey) {
    issues.push("VITE_SUPABASE_ANON_KEY is missing");
  }

  return issues.length > 0 ? `Supabase Auth is not configured: ${issues.join(", ")}.` : "";
};

export const isSupabaseConfigured = () => !getSupabaseConfigError();

export const getSupabaseBrowserClient = () => {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
};
