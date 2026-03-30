import { useState, useEffect } from "react";
import FriendList from "../components/friends/FriendList";
import FriendRequest from "../components/friends/FriendRequest";
import ChatBox from "../components/chat/ChatBox";
import MessageInput from "../components/chat/MessageInput";
import { sendRequest } from "../features/friends/sendRequest";
import { supabase } from "../lib/supabaseClient";
import { generateFriendCode } from "../utils/generateUsername";

export default function Friends({ currentUserId }) {
  const [tab, setTab] = useState("friends");
  const [friendCode, setFriendCode] = useState("");
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sending, setSending] = useState(false);
  const [friendListKey, setFriendListKey] = useState(0);
  const [myCode, setMyCode] = useState(null);
  const [codeLoading, setCodeLoading] = useState(true);
  const [codeError, setCodeError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Currently selected friend to chat with
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;
    loadOrCreateCode();
  }, [currentUserId]);

  async function loadOrCreateCode() {
    setCodeLoading(true);
    setCodeError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, friend_code")
        .eq("id", currentUserId)
        .maybeSingle();

      if (fetchError) {
        setCodeError(`Error: ${fetchError.message}`);
        setCodeLoading(false);
        return;
      }

      if (!data) {
        const newCode = generateFriendCode();
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: currentUserId,
            username: "user_" + Math.floor(100000 + Math.random() * 900000),
            display_name: "New User",
            friend_code: newCode,
          });

        if (insertError) {
          setCodeError(`Could not create profile: ${insertError.message}`);
        } else {
          setMyCode(newCode);
        }
        setCodeLoading(false);
        return;
      }

      if (!data.friend_code) {
        const newCode = generateFriendCode();
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ friend_code: newCode })
          .eq("id", currentUserId);

        if (updateError) {
          setCodeError(`Could not save code: ${updateError.message}`);
        } else {
          setMyCode(newCode);
        }
        setCodeLoading(false);
        return;
      }

      setMyCode(data.friend_code);
      setCodeLoading(false);
    } catch (err) {
      setCodeError(`Unexpected: ${err.message}`);
      setCodeLoading(false);
    }
  }

  function handleCopy() {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAccepted() {
    setFriendListKey((k) => k + 1);
    setTab("friends");
  }

  async function handleSendRequest(e) {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(null);
    if (!friendCode.trim()) return;
    setSending(true);

    const { error } = await sendRequest(currentUserId, friendCode.trim());

    if (error) {
      setSendError(error);
    } else {
      setSendSuccess("Friend request sent!");
      setFriendCode("");
    }
    setSending(false);
  }

  return (
    <div className="friends-page">

      {/* If a friend is selected, show chat */}
      {selectedFriend ? (
        <div className="chat-view">
          <button
            className="back-btn"
            onClick={() => setSelectedFriend(null)}
          >
            ← Back to Friends
          </button>
          <div className="chat-friend-name">
            {selectedFriend.display_name}
          </div>
          <ChatBox userId={currentUserId} friendId={selectedFriend.id} />
          <MessageInput userId={currentUserId} friendId={selectedFriend.id} />
        </div>
      ) : (
        <>
          <h2 className="friends-heading">Friends</h2>

          {/* Your own friend code */}
          <div className="my-code-card">
            <p className="my-code-label">Your Friend Code</p>
            {codeLoading ? (
              <p className="friends-status">Loading your code…</p>
            ) : codeError ? (
              <>
                <p className="friends-error">{codeError}</p>
                <button className="copy-btn" style={{ marginTop: 12 }} onClick={loadOrCreateCode}>
                  Retry
                </button>
              </>
            ) : myCode ? (
              <>
                <div className="my-code-row">
                  <code className="my-code">{myCode}</code>
                  <button className="copy-btn" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="my-code-hint">Share this with others so they can add you.</p>
              </>
            ) : null}
          </div>

          {/* Add friend by code */}
          <div className="send-request-card">
            <p className="send-request-label">Add friend by code</p>
            <form onSubmit={handleSendRequest} className="send-request-form">
              <input
                type="text"
                placeholder="Enter 10-character code"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                className="send-request-input"
                maxLength={10}
                required
              />
              <button type="submit" className="send-request-btn" disabled={sending}>
                {sending ? "Sending…" : "Send Request"}
              </button>
            </form>
            {sendError && <p className="friends-error">{sendError}</p>}
            {sendSuccess && <p className="friends-success">{sendSuccess}</p>}
          </div>

          {/* Tabs */}
          <div className="friends-tabs">
            <button
              className={`tab-btn ${tab === "friends" ? "active" : ""}`}
              onClick={() => setTab("friends")}
            >
              My Friends
            </button>
            <button
              className={`tab-btn ${tab === "requests" ? "active" : ""}`}
              onClick={() => setTab("requests")}
            >
              Requests
            </button>
          </div>

          {tab === "friends" ? (
            <FriendList
              key={friendListKey}
              currentUserId={currentUserId}
              onSelectFriend={setSelectedFriend}
            />
          ) : (
            <FriendRequest
              currentUserId={currentUserId}
              onAccepted={handleAccepted}
            />
          )}
        </>
      )}
    </div>
  );
}