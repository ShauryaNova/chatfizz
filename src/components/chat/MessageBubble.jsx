/**
 * Renders a single message bubble.
 * Aligns right if sent by current user, left if received.
 */
export default function MessageBubble({ message, isOwn }) {
  // Format timestamp to readable time
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`bubble-wrapper ${isOwn ? "own" : "other"}`}>
      <div className={`bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
        <p className="bubble-text">{message.content}</p>
        <span className="bubble-time">{time}</span>
      </div>
    </div>
  );
}