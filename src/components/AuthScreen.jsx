import { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function AuthScreen() {
const [mode, setMode] = useState("login");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [busy, setBusy] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

async function handleSubmit(event) {
event.preventDefault();
setBusy(true);
setMessage("");
setError("");

try {
  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() }
      }
    });

    if (error) throw error;

    if (data.session) {
      setMessage("Account created successfully!");
    } else {
      setMessage(
        "Account created! Check your email and verify your account, then sign in."
      );
      setMode("login");
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;
  }
} catch (err) {
  setError(err.message || "Something went wrong. Please try again.");
} finally {
  setBusy(false);
}

}

async function handleForgotPassword() {
setMessage("");
setError("");

if (!email.trim()) {
  setError("Enter your email address first.");
  return;
}

setBusy(true);

try {
  const { error } =
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });

  if (error) throw error;

  setMessage(
    "If this email is registered, a password reset link has been sent."
  );
} catch (err) {
  setError(err.message || "Could not send reset email.");
} finally {
  setBusy(false);
}

}

return (
<main className="auth-page">
<section className="auth-card">
<div className="auth-brand">
<span className="brand-mark">G<span>›</span></span>
<span>GoViral</span>
</div>

    <div className="eyebrow">YOUR CREATOR WORKSPACE</div>

    <h1>
      {mode === "signup" ? (
        <>Create your<br /><span>account.</span></>
      ) : (
        <>Welcome<br /><span>back.</span></>
      )}
    </h1>

    <p className="auth-intro">
      {mode === "signup"
        ? "Make your long videos work harder."
        : "Sign in to continue to your workspace."}
    </p>

    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "signup" && (
        <label>
          Display name
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Your name"
            maxLength={60}
            required
          />
        </label>
      )}

      <label>
        Email address
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          autoComplete={
            mode === "signup" ? "new-password" : "current-password"
          }
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </label>

      {mode === "login" && (
        <button
          className="auth-link forgot-link"
          type="button"
          onClick={handleForgotPassword}
          disabled={busy}
        >
          Forgot password?
        </button>
      )}

      <button
        className="primary-button auth-submit"
        type="submit"
        disabled={busy}
      >
        {busy
          ? "Please wait..."
          : mode === "signup"
            ? "Create account →"
            : "Sign in →"}
      </button>
    </form>

    {error && (
      <p className="auth-alert error" role="alert">{error}</p>
    )}

    {message && (
      <p className="auth-alert success" role="status">{message}</p>
    )}

    <div className="auth-switch">
      {mode === "signup"
        ? "Already have an account?"
        : "New to GoViral?"}

      <button
        className="auth-link"
        type="button"
        onClick={() => {
          setMode(mode === "signup" ? "login" : "signup");
          setError("");
          setMessage("");
        }}
      >
        {mode === "signup" ? "Sign in" : "Create account"}
      </button>
    </div>

    <p className="auth-terms">
      Keep your password private. Never share it with anyone.
    </p>
  </section>
</main>

);
}