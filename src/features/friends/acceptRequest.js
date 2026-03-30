import { supabase } from "../../lib/supabaseClient";

export async function acceptRequest(requestId, fromUserId, currentUserId) {
  try {
    // 1. Insert both directions into friends table
    const { error: friendError } = await supabase.from("friends").insert([
      { user_id: currentUserId, friend_id: fromUserId },
      { user_id: fromUserId, friend_id: currentUserId },
    ]);

    if (friendError) return { error: friendError.message };

    // 2. Delete the request row
    const { error: deleteError } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId);

    if (deleteError) return { error: deleteError.message };

    return { error: null };
  } catch (err) {
    return { error: err.message || "Unexpected error." };
  }
}