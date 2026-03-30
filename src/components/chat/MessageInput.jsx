import { useState, useRef } from "react";
import { sendMessage } from "../../features/chat/sendMessage";

export default function MessageInput({ userId, friendId, onTyping, onStoppedTyping }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Timeout ref to detect when user stopped typing
  const typingTimeoutRef = useRef(null);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    setError(null);

    // Tell friend we stopped typing before sending
    if (onStoppedTyping) onStoppedTyping();

    const { error: sendError } = await sendMessage(userId, friendId, text);

    if (sendError) {
      setError(sendError);
    } else {
      setText("");
    }

    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e) {
    setText(e.target.value);

    // Broadcast typing event
    if (onTyping) onTyping();

    // Clear previous stop-typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // If user stops typing for 1.5s, broadcast stopped_typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onStoppedTyping) onStoppedTyping();
    }, 1500);
  }

  return (
    <div className="message-input-bar">
      {error && <p className="chat-error">{error}</p>}
      <div className="message-input-row">
        <input
          type="text"
          className="message-input"
          placeholder="Type a message…"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={sending}
          autoComplete="off"
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={sending || !text.trim()}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}