import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * Handles typing indicator using Supabase Realtime Broadcast.
 * - Broadcasts "typing" events when current user types
 * - Listens for "typing" events from the friend
 */
export function useTyping(currentUserId, friendId) {
  const [friendIsTyping, setFriendIsTyping] = useState(false);

  // Ref to hold the channel so we can broadcast from MessageInput
  const channelRef = useRef(null);

  // Ref to clear the "friend is typing" indicator after they stop
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUserId || !friendId) return;

    // Unique channel per conversation (same for both users)
    const channelName = [currentUserId, friendId].sort().join("_typing_");

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        // Only react to the friend's typing events, not our own
        if (payload.user_id !== currentUserId) {
          setFriendIsTyping(true);

          // Clear previous timeout
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

          // Hide indicator after 2s of no typing events from friend
          typingTimeoutRef.current = setTimeout(() => {
            setFriendIsTyping(false);
          }, 2000);
        }
      })
      .on("broadcast", { event: "stopped_typing" }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setFriendIsTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [currentUserId, friendId]);

  /**
   * Call this whenever the current user types something.
   * Broadcasts a "typing" event to the friend.
   */
  async function broadcastTyping() {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId },
    });
  }

  /**
   * Call this when the user clears input or sends a message.
   * Broadcasts a "stopped_typing" event.
   */
  async function broadcastStoppedTyping() {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "stopped_typing",
      payload: { user_id: currentUserId },
    });
  }

  return { friendIsTyping, broadcastTyping, broadcastStoppedTyping };
}