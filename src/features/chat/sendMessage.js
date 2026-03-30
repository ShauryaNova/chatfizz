import { supabase } from "../../lib/supabaseClient";

/**
 * Sends a message from currentUserId to friendId.
 * Inserts a row into the messages table.
 */
export async function sendMessage(currentUserId, friendId, content) {
  // Don't send empty messages
  if (!content || !content.trim()) {
    return { error: "Message cannot be empty." };
  }

  const { error } = await supabase.from("messages").insert({
    from_user_id: currentUserId,
    to_user_id: friendId,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  return { error: null };
}