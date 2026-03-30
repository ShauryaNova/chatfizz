import { supabase } from "../../lib/supabaseClient";

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err.message || "An unexpected error occurred." };
  }
}