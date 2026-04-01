/**
 * Renders a single message bubble.
 * Time shown in the user's own device timezone automatically.
 */
export default function MessageBubble({ message, isOwn }) {
  // Uses device local time — works correctly for every timezone globally
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // shows AM/PM — remove this line if you prefer 24hr
  });

  // Show date if message is not from today
  const today = new Date().toDateString();
  const msgDate = new Date(message.created_at).toDateString();
  const showDate = today !== msgDate;
  const dateLabel = new Date(message.created_at).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`bubble-wrapper ${isOwn ? "own" : "other"}`}>
      <div className={`bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
        <p className="bubble-text">{message.content}</p>
        <span className="bubble-time">
          {showDate ? `${dateLabel}, ${time}` : time}
        </span>
      </div>
    </div>
  );
}