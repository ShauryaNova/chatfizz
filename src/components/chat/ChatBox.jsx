import { useEffect, useRef, useState } from "react";
import { fetchMessages } from "../../features/chat/fetchMessages";
import { subscribeMessages } from "../../features/chat/subscribeMessages";
import MessageBubble from "./MessageBubble";

export default function ChatBox({ userId, friendId, friendIsTyping, friendName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!userId || !friendId) return;

    loadMessages();

    const channel = subscribeMessages(userId, friendId, (newMsg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => channel.unsubscribe();
  }, [userId, friendId]);

  // Scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, friendIsTyping]);

  async function loadMessages() {
    setLoading(true);
    setError(null);
    const { messages: data, error: err } = await fetchMessages(userId, friendId);
    if (err) setError(err);
    else setMessages(data);
    setLoading(false);
  }

  if (loading) return <div className="chat-status">Loading messages…</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chatbox">
      <div className="chatbox-messages">
        {messages.length === 0 && !friendIsTyping && (
          <p className="chat-status">No messages yet. Say hello!</p>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.from_user_id === userId}
          />
        ))}

        {/* Typing bubble — shown when friend is typing */}
        {friendIsTyping && (
          <div className="bubble-wrapper other">
            <div className="bubble bubble-other typing-bubble">
              <span className="typing-dots">
                <span /><span /><span />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}