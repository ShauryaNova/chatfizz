import { supabase } from "../../lib/supabaseClient";

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message || "An unexpected error occurred." };
  }
}