import { useState } from "react";
import { signupUser } from "../features/auth/signupUser";

export default function Signup({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error: signupError } = await signupUser(email, password, displayName);

    if (signupError) {
      setError(signupError);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="auth-card">
        <h2>Check your email</h2>
        <p className="auth-subtitle">
          We sent a confirmation link to <strong>{email}</strong>. Confirm your
          email to finish signing up.
        </p>
        <p className="auth-switch">
          Already confirmed?{" "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Sign in
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p className="auth-subtitle">Join the conversation</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label htmlFor="signup-name">Display name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Jane Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <button type="button" className="link-btn" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </div>
  );
}