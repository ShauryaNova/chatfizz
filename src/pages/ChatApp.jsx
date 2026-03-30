import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { logoutUser } from "../features/auth/logoutUser";

/**
 * Root layout after login.
 * Left sidebar = friends list.
 * Right panel = active chat or empty state.
 */
export default function ChatApp({ user }) {
  const [selectedFriend, setSelectedFriend] = useState(null);

  async function handleLogout() {
    await logoutUser();
  }

  return (
    <div className="app-layout">
      {/* Left sidebar */}
      <Sidebar
        currentUserId={user.id}
        currentUserEmail={user.email}
        selectedFriendId={selectedFriend?.id}
        onSelectFriend={setSelectedFriend}
        onLogout={handleLogout}
      />

      {/* Right chat panel */}
      <main className="chat-panel">
        {selectedFriend ? (
          <ChatWindow
            userId={user.id}
            friend={selectedFriend}
          />
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h2>Select a friend to start chatting</h2>
            <p>Your conversations will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}