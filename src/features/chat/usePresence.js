import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Single global channel — free tier safe (uses only 1 realtime slot)
let channel = null;
let listeners = new Set();
let userCount = 0;

function getOnlineIds(state) {
  return new Set(Object.keys(state));
}

/**
 * Global presence tracker.
 * One shared channel for the entire app — won't hit free tier limits.
 */
export function usePresence(currentUserId, friendId) {
  const [isFriendOnline, setIsFriendOnline] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    userCount++;

    function updateOnlineStatus(state) {
      const ids = getOnlineIds(state);
      // Notify all listeners
      listeners.forEach((cb) => cb(ids));
    }

    // Create channel only once
    if (!channel) {
      channel = supabase.channel("presence_global", {
        config: {
          presence: { key: currentUserId },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          updateOnlineStatus(channel.presenceState());
        })
        .on("presence", { event: "join" }, () => {
          updateOnlineStatus(channel.presenceState());
        })
        .on("presence", { event: "leave" }, () => {
          updateOnlineStatus(channel.presenceState());
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: currentUserId,
              online_at: new Date().toISOString(),
            });
          }
        });
    } else {
      // Re-track on re-mount (e.g. page navigation)
      if (channel.state === "joined") {
        channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        });
      }
    }

    // Register this hook's listener
    function onUpdate(ids) {
      if (friendId) {
        setIsFriendOnline(ids.has(friendId));
      }
    }

    listeners.add(onUpdate);

    return () => {
      listeners.delete(onUpdate);
      userCount--;

      if (userCount === 0 && channel) {
        channel.untrack();
        channel.unsubscribe();
        channel = null;
      }
    };
  }, [currentUserId, friendId]);

  return { isFriendOnline };
}