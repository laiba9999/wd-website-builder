"use client";
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";

/**
 * Compression happens here, in the browser, before anything is uploaded.
 * This is not a nicety — it is what keeps the project inside Supabase's 1 GB
 * free storage. Roughly 250 KB per image means ~400 weddings on the free tier.
 */
const OPTIONS = { maxSizeMB: 0.25, maxWidthOrHeight: 1600, useWebWorker: true, fileType: "image/jpeg" };

export default function ImageUploader({
  token, kind, label, disabled, onUploaded,
}: {
  token: string;
  kind: "hero" | "gallery";
  label: string;
  disabled?: boolean;
  onUploaded: (path: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, OPTIONS);
        const form = new FormData();
        form.append("token", token);
        form.append("kind", kind);
        form.append("file", new File([compressed], file.name, { type: "image/jpeg" }));
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Upload failed");
        onUploaded(body.path);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={kind === "gallery"}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      <button
        type="button"
        className="ed-ghost"
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
      >
        {busy ? "Compressing and uploading…" : label}
      </button>
      {error && <p style={{ color: "#b3261e", fontSize: ".8rem", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
