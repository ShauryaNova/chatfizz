import { supabase } from "../../lib/supabaseClient";

/**
 * Subscribes to realtime INSERT events on the messages table.
 * Only calls onNewMessage if the message belongs to the current chat.
 * Returns the channel so it can be unsubscribed on cleanup.
 */
export function subscribeMessages(currentUserId, friendId, onNewMessage) {
  const channel = supabase
    .channel(`chat_${currentUserId}_${friendId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const msg = payload.new;

        // Check if this message belongs to the current conversation
        const isCurrentChat =
          (msg.from_user_id === currentUserId && msg.to_user_id === friendId) ||
          (msg.from_user_id === friendId && msg.to_user_id === currentUserId);

        if (isCurrentChat) {
          onNewMessage(msg);
        }
      }
    )
    .subscribe();

  return channel;
}