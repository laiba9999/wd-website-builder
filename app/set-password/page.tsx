"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function acceptInvitation() {
      const supabase = supabaseBrowser();
      const hash = new URLSearchParams(window.location.hash.slice(1));

      const invitationError = hash.get("error_description");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (invitationError) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setError("This invitation link is invalid or has expired.");
        return;
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Remove sensitive authentication tokens from the address bar.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        if (sessionError) {
          setError("This invitation link is invalid or has expired.");
          return;
        }
      }

      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user) {
        setError("This invitation link is invalid or has expired.");
        return;
      }

      setReady(true);
    }

    void acceptInvitation();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
      const { error: updateError } = await supabaseBrowser().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ed-shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24 }}>
      <form className="ed-card" onSubmit={submit} style={{ width: "100%", maxWidth: 460 }}>
        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300, fontSize: "2rem", margin: "0 0 6px" }}>
          Choose your password
        </h1>
        <p style={{ color: "#7a766e", margin: "0 0 22px", fontSize: ".88rem", lineHeight: 1.7 }}>
          Your invitation is confirmed. Set a password to finish creating your account.
        </p>

        <div className="ed-field" style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password"
            placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        <div className="ed-field" style={{ marginBottom: 20 }}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" required minLength={8} autoComplete="new-password"
            placeholder="Enter your password again" value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)} />
        </div>

        <button type="submit" className="ed-btn primary" style={{ width: "100%", padding: 13 }} disabled={busy || !ready}>
          {!ready && !error ? "Checking invitation…" : busy ? "Saving password…" : "Save password"}
        </button>

        {error && <p style={{ color: "#b3261e", fontSize: ".85rem", marginTop: 12 }}>{error}</p>}
      </form>
    </main>
  );
}
