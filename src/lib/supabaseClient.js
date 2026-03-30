import { createClient } from "@supabase/supabase-js";

// get values from env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);