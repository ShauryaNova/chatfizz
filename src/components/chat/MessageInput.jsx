import { useState, useRef } from "react";
import { sendMessage } from "../../features/chat/sendMessage";

export default function MessageInput({ userId, friendId, onTyping, onStoppedTyping, onOptimisticSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);

  async function handleSend() {
    if (!text.trim() || sending) return;

    const content = text.trim();

    // 1. Clear input immediately — feels instant
    setText("");
    setSending(true);
    setError(null);

    // 2. Stop typing indicator
    if (onStoppedTyping) onStoppedTyping();

    // 3. Optimistically add message to UI before DB confirms
    if (onOptimisticSend) {
      onOptimisticSend({
        id: `optimistic_${Date.now()}`, // temp id
        from_user_id: userId,
        to_user_id: friendId,
        content,
        created_at: new Date().toISOString(),
        optimistic: true, // flag so we can replace it with real msg
      });
    }

    // 4. Send to database in background
    const { error: sendError } = await sendMessage(userId, friendId, content);

    if (sendError) {
      setError(sendError);
      // Restore text if send failed
      setText(content);
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

    if (onTyping) onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
          disabled={false} // never disable — feels laggy
          autoComplete="off"
          autoFocus
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}