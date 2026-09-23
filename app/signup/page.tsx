"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    setBusy(true);

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteCode }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to send your invitation.");
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
            We&rsquo;ve sent an invitation email to{" "}
            <strong>{email}</strong>.
          </p>

          <p style={{ lineHeight: 1.7, color: "#7a766e" }}>
            Open the link in that email, choose your password, and then you can
            create your wedding website.
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
          This private preview is invitation-only. Enter the access code you
          were given and we&rsquo;ll email you an account invitation.
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

        <div className="ed-field" style={{ marginBottom: 20 }}>
          <label htmlFor="inviteCode">Invitation code</label>

          <input
            id="inviteCode"
            type="password"
            required
            autoComplete="off"
            placeholder="Your invitation code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
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
          {busy ? "Sending invitation…" : "Request invitation"}
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
