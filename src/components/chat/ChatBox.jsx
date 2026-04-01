import { useEffect, useRef, useState, useCallback } from "react";
import { fetchMessages } from "../../features/chat/fetchMessages";
import { subscribeMessages } from "../../features/chat/subscribeMessages";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useTyping } from "../../features/chat/useTyping";

/**
 * Combined ChatBox + MessageInput.
 * Handles optimistic updates so messages appear instantly.
 * Realtime subscription replaces optimistic messages with real ones.
 */
export default function ChatBox({ userId, friendId, friendIsTyping, friendName }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!userId || !friendId) return;

    setMessages([]); // clear previous chat instantly
    loadMessages();

    // Subscribe to realtime inserts
    const channel = subscribeMessages(userId, friendId, (newMsg) => {
      setMessages((prev) => {
        // Replace optimistic message with real one from DB
        const hasOptimistic = prev.find(
          (m) =>
            m.optimistic &&
            m.from_user_id === newMsg.from_user_id &&
            m.content === newMsg.content
        );

        if (hasOptimistic) {
          // Swap optimistic for real
          return prev.map((m) =>
            m.optimistic &&
            m.from_user_id === newMsg.from_user_id &&
            m.content === newMsg.content
              ? newMsg
              : m
          );
        }

        // Deduplicate by id
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => channel.unsubscribe();
  }, [userId, friendId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, friendIsTyping]);

  async function loadMessages() {
    setLoading(true);
    const { messages: data, error: err } = await fetchMessages(userId, friendId);
    if (err) setError(err);
    else setMessages(data);
    setLoading(false);
  }

  // Called by MessageInput to add optimistic message
  function handleOptimisticSend(msg) {
    setMessages((prev) => [...prev, msg]);
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

        {/* Typing bubble */}
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