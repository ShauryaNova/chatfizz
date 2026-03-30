import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getFriends } from "../../features/friends/getFriends";
import { generateFriendCode } from "../../utils/generateUsername";
import FriendRequest from "../friends/FriendRequest";
import AddFriend from "../friends/AddFriend";

/**
 * Left sidebar with:
 * - User info + friend code
 * - Friends list with count
 * - Tabs: Chats | Requests | Add Friend
 */
export default function Sidebar({
  currentUserId,
  currentUserEmail,
  selectedFriendId,
  onSelectFriend,
  onLogout,
}) {
  const [tab, setTab] = useState("chats");
  const [friends, setFriends] = useState([]);
  const [myCode, setMyCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    loadFriends();
    loadCode();
  }, [currentUserId]);

  async function loadFriends() {
    setLoading(true);
    const { friends: data } = await getFriends(currentUserId);
    setFriends(data || []);
    setLoading(false);
  }

  async function loadCode() {
    const { data } = await supabase
      .from("profiles")
      .select("friend_code")
      .eq("id", currentUserId)
      .single();

    if (data?.friend_code) {
      setMyCode(data.friend_code);
    } else {
      // Generate and save if missing
      const newCode = generateFriendCode();
      await supabase
        .from("profiles")
        .update({ friend_code: newCode })
        .eq("id", currentUserId);
      setMyCode(newCode);
    }
  }

  function handleCopy() {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="sidebar">
      {/* User info at top */}
      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {currentUserEmail?.[0]?.toUpperCase()}
          </div>
          <div className="sidebar-user-text">
            <span className="sidebar-email">{currentUserEmail}</span>
            {myCode && (
              <button className="sidebar-code" onClick={handleCopy}>
                {copied ? "Copied!" : `# ${myCode}`}
              </button>
            )}
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title="Sign out">
          ⏻
        </button>
      </div>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${tab === "chats" ? "active" : ""}`}
          onClick={() => setTab("chats")}
        >
          Chats
          {friends.length > 0 && (
            <span className="friend-count">{friends.length}</span>
          )}
        </button>
        <button
          className={`sidebar-tab ${tab === "requests" ? "active" : ""}`}
          onClick={() => setTab("requests")}
        >
          Requests
        </button>
        <button
          className={`sidebar-tab ${tab === "add" ? "active" : ""}`}
          onClick={() => setTab("add")}
        >
          + Add
        </button>
      </div>

      {/* Tab content */}
      <div className="sidebar-content">
        {tab === "chats" && (
          <>
            {loading ? (
              <p className="sidebar-status">Loading…</p>
            ) : friends.length === 0 ? (
              <p className="sidebar-status">No friends yet. Add some!</p>
            ) : (
              <ul className="sidebar-friends">
                {friends.map((f) => (
                  <li
                    key={f.id}
                    className={`sidebar-friend ${
                      selectedFriendId === f.profiles?.id ? "selected" : ""
                    }`}
                    onClick={() => onSelectFriend(f.profiles)}
                  >
                    <div className="sidebar-friend-avatar">
                      {f.profiles?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="sidebar-friend-info">
                      <span className="sidebar-friend-name">
                        {f.profiles?.display_name}
                      </span>
                      <span className="sidebar-friend-username">
                        @{f.profiles?.username}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "requests" && (
          <FriendRequest
            currentUserId={currentUserId}
            onAccepted={() => {
              loadFriends();
              setTab("chats");
            }}
          />
        )}

        {tab === "add" && (
          <AddFriend currentUserId={currentUserId} />
        )}
      </div>
    </aside>
  );
}