import { useState } from "react";
import { sendRequest } from "../../features/friends/sendRequest";

/**
 * Form to add a friend by their 10-character friend code.
 */
export default function AddFriend({ currentUserId }) {
  const [friendCode, setFriendCode] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSending(true);

    const { error: err } = await sendRequest(currentUserId, friendCode.trim());

    if (err) setError(err);
    else {
      setSuccess("Friend request sent!");
      setFriendCode("");
    }

    setSending(false);
  }

  return (
    <div className="add-friend">
      <p className="add-friend-label">Enter friend code</p>
      <form onSubmit={handleSubmit} className="add-friend-form">
        <input
          type="text"
          placeholder="e.g. aB3kR9mZ2x"
          value={friendCode}
          onChange={(e) => setFriendCode(e.target.value)}
          className="add-friend-input"
          maxLength={10}
          required
        />
        <button type="submit" className="add-friend-btn" disabled={sending}>
          {sending ? "Sending…" : "Send Request"}
        </button>
      </form>
      {error && <p className="sidebar-error">{error}</p>}
      {success && <p className="sidebar-success">{success}</p>}
    </div>
  );
}