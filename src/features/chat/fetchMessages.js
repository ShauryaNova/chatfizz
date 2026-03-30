import { supabase } from "../../lib/supabaseClient";

/**
 * Fetches all messages between currentUserId and friendId.
 * Gets messages in both directions and sorts by time.
 */
export async function fetchMessages(currentUserId, friendId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      // Direction 1: I sent to friend
      `and(from_user_id.eq.${currentUserId},to_user_id.eq.${friendId}),` +
      // Direction 2: Friend sent to me
      `and(from_user_id.eq.${friendId},to_user_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) return { messages: [], error: error.message };
  return { messages: data, error: null };
}