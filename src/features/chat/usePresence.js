import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * Tracks online/offline status using Supabase Realtime Presence.
 * Call this with your own userId to broadcast presence,
 * and pass a friendId to track if they are online.
 */
export function usePresence(currentUserId, friendId) {
  const [isFriendOnline, setIsFriendOnline] = useState(false);

  useEffect(() => {
    if (!currentUserId || !friendId) return;

    // Create a presence channel — all users join the same channel
    const channel = supabase.channel("online_users", {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Get the full state of who is online
        const state = channel.presenceState();

        // Check if friendId appears in the presence state keys
        const onlineUserIds = Object.keys(state);
        setIsFriendOnline(onlineUserIds.includes(friendId));
      })
      .on("presence", { event: "join" }, ({ key }) => {
        // Someone came online
        if (key === friendId) setIsFriendOnline(true);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        // Someone went offline
        if (key === friendId) setIsFriendOnline(false);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Broadcast that current user is online
          await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });

    // Cleanup: untrack presence when component unmounts
    return () => {
      channel.untrack();
      channel.unsubscribe();
    };
  }, [currentUserId, friendId]);

  return { isFriendOnline };
}