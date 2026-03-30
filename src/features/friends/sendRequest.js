import { supabase } from "../../lib/supabaseClient";

export async function sendRequest(currentUserId, friendCode) {
  try {
    // 1. Find user by friend_code (exact match, trimmed)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, username, friend_code")
      .eq("friend_code", friendCode.trim())
      .maybeSingle();

    if (profileError) return { error: profileError.message };
    if (!profile) return { error: `No user found with that friend code.` };

    // 2. Prevent sending to yourself
    if (profile.id === currentUserId) {
      return { error: "You cannot send a friend request to yourself." };
    }

    // 3. Check if already friends
    const { data: alreadyFriend } = await supabase
      .from("friends")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("friend_id", profile.id)
      .maybeSingle();

    if (alreadyFriend) return { error: "You are already friends with this user." };

    // 4. Check if request already pending (either direction)
    const { data: duplicate } = await supabase
      .from("friend_requests")
      .select("id")
      .or(
        `and(from_user_id.eq.${currentUserId},to_user_id.eq.${profile.id}),and(from_user_id.eq.${profile.id},to_user_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (duplicate) return { error: "A friend request already exists with this user." };

    // 5. Insert request with status 'pending'
    const { error: insertError } = await supabase
      .from("friend_requests")
      .insert({
        from_user_id: currentUserId,
        to_user_id: profile.id,
        status: "pending",
      });

    if (insertError) return { error: insertError.message };

    return { error: null };
  } catch (err) {
    return { error: err.message || "Unexpected error." };
  }
}