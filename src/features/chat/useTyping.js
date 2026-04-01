import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useTyping(currentUserId, friendId) {
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  const channelRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUserId || !friendId) return;

    // Sort ids so both users join the same channel name
    const channelName = `typing_${[currentUserId, friendId].sort().join("_")}`;

    const ch = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === currentUserId) return; // ignore own events

        setFriendIsTyping(true);

        // Auto-hide after 2s if no new typing event
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          setFriendIsTyping(false);
        }, 2000);
      })
      .on("broadcast", { event: "stop" }, ({ payload }) => {
        if (payload.user_id === currentUserId) return;
        setFriendIsTyping(false);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      })
      .subscribe();

    channelRef.current = ch;

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      ch.unsubscribe();
      channelRef.current = null;
    };
  }, [currentUserId, friendId]);

  async function broadcastTyping() {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId },
    });
  }

  async function broadcastStoppedTyping() {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "stop",
      payload: { user_id: currentUserId },
    });
  }

  return { friendIsTyping, broadcastTyping, broadcastStoppedTyping };
}