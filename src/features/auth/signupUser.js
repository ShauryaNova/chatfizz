import { supabase } from "../../lib/supabaseClient";
import { generateUsername, generateFriendCode } from "../../utils/generateUsername";

export async function signupUser(email, password, displayName) {
  try {
    // 1. Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) return { user: null, error: signUpError.message };

    const user = data.user;
    if (!user) return { user: null, error: "Signup succeeded but no user returned." };

    // 2. Trigger already created the profile row — update it with real values
    const username = generateUsername(displayName);
    const friend_code = generateFriendCode();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName,
        friend_code,
      })
      .eq("id", user.id);

    // Don't block signup if update fails — trigger ensures row exists
    if (updateError) console.warn("Profile update failed:", updateError.message);

    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.message || "An unexpected error occurred." };
  }
}