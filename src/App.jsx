import { useState, useEffect } from "react";
import { useAuth } from "./auth/useAuth";
import Auth from "./pages/Auth";
import ChatApp from "./pages/ChatApp";
import { logoutUser } from "./features/auth/logoutUser";

export default function App() {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(id);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="splash">
        <span className="spinner" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return <ChatApp user={user} />;
}