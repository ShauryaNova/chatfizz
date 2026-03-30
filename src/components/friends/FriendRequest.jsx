import { useEffect, useState } from "react";
import { getIncomingRequests } from "../../features/friends/getFriends";
import { acceptRequest } from "../../features/friends/acceptRequest";
import { supabase } from "../../lib/supabaseClient";

export default function FriendRequest({ currentUserId, onAccepted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null); // tracks which request is being actioned

  useEffect(() => {
    if (!currentUserId) return;
    load();
  }, [currentUserId]);

  async function load() {
    setLoading(true);
    const { requests: data, error: err } = await getIncomingRequests(currentUserId);
    if (err) setError(err);
    else setRequests(data);
    setLoading(false);
  }

  async function handleAccept(request) {
    setActionId(request.id);
    const { error: err } = await acceptRequest(
      request.id,
      request.from_user_id,
      currentUserId
    );

    if (err) {
      setError(err);
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      if (onAccepted) onAccepted();
    }
    setActionId(null);
  }

  async function handleReject(request) {
    setActionId(request.id);

    const { error: err } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", request.id);

    if (err) {
      setError(err.message);
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    }
    setActionId(null);
  }

  if (loading) return <p className="friends-status">Loading requests…</p>;
  if (error) return <p className="friends-error">{error}</p>;
  if (requests.length === 0)
    return <p className="friends-status">No incoming friend requests.</p>;

  return (
    <ul className="friends-list">
      {requests.map((r) => (
        <li key={r.id} className="friends-item">
          <div className="friend-avatar">
            {r.profiles?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="friend-info">
            <span className="friend-name">{r.profiles?.display_name}</span>
            <span className="friend-username">@{r.profiles?.username}</span>
          </div>
          <div className="request-actions">
            <button
              className="accept-btn"
              onClick={() => handleAccept(r)}
              disabled={actionId === r.id}
            >
              {actionId === r.id ? "…" : "Accept"}
            </button>
            <button
              className="reject-btn"
              onClick={() => handleReject(r)}
              disabled={actionId === r.id}
            >
              {actionId === r.id ? "…" : "Reject"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}