"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      const supabase = supabaseBrowser();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <main
        className="ed-shell"
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <div
          className="ed-card"
          style={{
            width: "100%",
            maxWidth: 460,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 300,
              fontSize: "2rem",
              margin: "0 0 12px",
            }}
          >
            Check your email
          </h1>

          <p style={{ lineHeight: 1.7, color: "#7a766e" }}>
            We've sent a confirmation email to{" "}
            <strong>{email}</strong>.
          </p>

          <p style={{ lineHeight: 1.7, color: "#7a766e" }}>
            Confirm your email address and then you'll be able to access your
            dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="ed-shell"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <form
        className="ed-card"
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 460,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 300,
            fontSize: "2rem",
            margin: "0 0 6px",
          }}
        >
          Create your account
        </h1>

        <p
          style={{
            color: "#7a766e",
            margin: "0 0 22px",
            fontSize: ".88rem",
            lineHeight: 1.7,
          }}
        >
          Create an account to build and manage your wedding website.
        </p>

        <div className="ed-field" style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="ed-field" style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="ed-field" style={{ marginBottom: 20 }}>
          <label htmlFor="confirmPassword">
            Confirm password
          </label>

          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="ed-btn primary"
          style={{
            width: "100%",
            padding: 13,
          }}
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        {error && (
          <p
            style={{
              color: "#b3261e",
              fontSize: ".85rem",
              marginTop: 12,
            }}
          >
            {error}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#8a8580",
            fontSize: ".82rem",
            marginTop: 22,
            marginBottom: 0,
          }}
        >
          Already have an account?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}