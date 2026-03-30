import { useEffect, useState } from "react";
import { getFriends } from "../../features/friends/getFriends";

export default function FriendList({ currentUserId, onSelectFriend }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;
    load();
  }, [currentUserId]);

  async function load() {
    setLoading(true);
    const { friends: data, error: err } = await getFriends(currentUserId);
    if (err) setError(err);
    else setFriends(data);
    setLoading(false);
  }

  if (loading) return <p className="friends-status">Loading friends…</p>;
  if (error) return <p className="friends-error">{error}</p>;
  if (friends.length === 0)
    return <p className="friends-status">You have no friends yet.</p>;

  return (
    <ul className="friends-list">
      {friends.map((f) => (
        <li
          key={f.id}
          className="friends-item clickable"
          onClick={() => onSelectFriend(f.profiles)}
        >
          <div className="friend-avatar">
            {f.profiles?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="friend-info">
            <span className="friend-name">{f.profiles?.display_name}</span>
            <span className="friend-username">@{f.profiles?.username}</span>
          </div>
          <span className="chat-arrow">💬</span>
        </li>
      ))}
    </ul>
  );
}