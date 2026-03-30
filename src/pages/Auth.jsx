import { useState } from "react";
import Login from "../auth/Login";
import Signup from "../auth/Signup";

export default function Auth() {
  const [view, setView] = useState("login");

  return (
    <div className="auth-page">
      <div className="auth-logo">💬</div>
      {view === "login" ? (
        <Login onSwitch={() => setView("signup")} />
      ) : (
        <Signup onSwitch={() => setView("login")} />
      )}
    </div>
  );
}