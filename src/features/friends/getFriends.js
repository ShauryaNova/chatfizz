import { supabase } from "../../lib/supabaseClient";

export async function getFriends(currentUserId) {
  try {
    // Step 1: get all friend_ids for this user
    const { data: friendRows, error: friendError } = await supabase
      .from("friends")
      .select("id, friend_id")
      .eq("user_id", currentUserId);

    if (friendError) return { friends: [], error: friendError.message };
    if (!friendRows || friendRows.length === 0) return { friends: [], error: null };

    // Step 2: get profiles for those friend_ids
    const friendIds = friendRows.map((f) => f.friend_id);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, display_name, friend_code")
      .in("id", friendIds);

    if (profileError) return { friends: [], error: profileError.message };

    // Step 3: merge
    const friends = friendRows.map((f) => ({
      id: f.id,
      friend_id: f.friend_id,
      profiles: profiles.find((p) => p.id === f.friend_id) ?? null,
    }));

    return { friends, error: null };
  } catch (err) {
    return { friends: [], error: err.message || "Unexpected error." };
  }
}

export async function getIncomingRequests(currentUserId) {
  try {
    // Step 1: get pending requests sent to this user
    const { data: requestRows, error: requestError } = await supabase
      .from("friend_requests")
      .select("id, from_user_id, status")
      .eq("to_user_id", currentUserId)
      .eq("status", "pending");

    if (requestError) return { requests: [], error: requestError.message };
    if (!requestRows || requestRows.length === 0) return { requests: [], error: null };

    // Step 2: get profiles for all senders
    const senderIds = requestRows.map((r) => r.from_user_id);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, display_name, friend_code")
      .in("id", senderIds);

    if (profileError) return { requests: [], error: profileError.message };

    // Step 3: merge
    const requests = requestRows.map((r) => ({
      id: r.id,
      from_user_id: r.from_user_id,
      status: r.status,
      profiles: profiles.find((p) => p.id === r.from_user_id) ?? null,
    }));

    return { requests, error: null };
  } catch (err) {
    return { requests: [], error: err.message || "Unexpected error." };
  }
}