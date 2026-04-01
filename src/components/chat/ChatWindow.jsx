import { useRef } from "react";
import ChatBox from "./ChatBox";
import MessageInput from "./MessageInput";
import { usePresence } from "../../features/chat/usePresence";
import { useTyping } from "../../features/chat/useTyping";

export default function ChatWindow({ userId, friend }) {
  const { isFriendOnline } = usePresence(userId, friend?.id);
  const { friendIsTyping, broadcastTyping, broadcastStoppedTyping } = useTyping(
    userId,
    friend?.id
  );

  // Ref to call ChatBox's optimistic handler
  const optimisticRef = useRef(null);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-avatar-wrap">
          <div className="chat-header-avatar">
            {friend?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className={`presence-dot ${isFriendOnline ? "online" : "offline"}`} />
        </div>

        <div className="chat-header-info">
          <span className="chat-header-name">{friend?.display_name}</span>
          {friendIsTyping ? (
            <span className="chat-header-typing">
              <span className="typing-dots">
                <span /><span /><span />
              </span>
              typing…
            </span>
          ) : (
            <span className={`chat-header-status ${isFriendOnline ? "online" : ""}`}>
              {isFriendOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* ChatBox handles its own optimistic ref */}
      <ChatBox
        userId={userId}
        friendId={friend?.id}
        friendIsTyping={friendIsTyping}
        friendName={friend?.display_name}
        optimisticRef={optimisticRef}
      />

      <MessageInput
        userId={userId}
        friendId={friend?.id}
        onTyping={broadcastTyping}
        onStoppedTyping={broadcastStoppedTyping}
        onOptimisticSend={(msg) => optimisticRef.current?.(msg)}
      />
    </div>
  );
}