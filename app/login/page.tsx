"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      const supabase = supabaseBrowser();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setBusy(false);
    }
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
          Welcome back
        </h1>

        <p
          style={{
            color: "#7a766e",
            margin: "0 0 22px",
            fontSize: ".88rem",
            lineHeight: 1.7,
          }}
        >
          Sign in to create and manage your wedding website.
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
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {busy ? "Signing in…" : "Sign in"}
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
            marginTop: 22, //L
            marginBottom: 0,
          }}
        >
          Don't have an account?{" "}
          <Link href="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}