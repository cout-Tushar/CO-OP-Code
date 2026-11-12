"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useSignedIn } from "@/lib/session";
export default function RoomActions() {
  const router = useRouter();
  const signedIn = useSignedIn();
  const [roomId, setRoomId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create() {
    if (!localStorage.getItem("token")) {
      router.push("/signin");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await api<{ roomId: string }>("/create-room");
      router.push(`/room/${encodeURIComponent(data.roomId)}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create room.",
      );
    } finally {
      setBusy(false);
    }
  }
  function join(event: React.FormEvent) {
    event.preventDefault();
    const id = roomId.trim();
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
      setError(
        "Enter a valid invite code (letters, numbers, hyphens or underscores).",
      );
      return;
    }
    const path = `/room/${encodeURIComponent(id)}`;
    router.push(
      localStorage.getItem("token")
        ? path
        : `/signin?next=${encodeURIComponent(path)}`,
    );
  }
  return (
    <div className="room-actions" id="start">
      <div className="eyebrow">YOUR NEXT SESSION</div>
      <h2>Great code starts together.</h2>
      <p>Create a shared space, or pick up where your team left off.</p>
      <button className="button primary full" onClick={create} disabled={busy}>
        <Plus size={18} />
        {busy ? "Creating room…" : "Create a room"}
        <ArrowRight size={18} />
      </button>
      <div className="divider">
        <span>Have an invite?</span>
      </div>
      <form onSubmit={join}>
        <label htmlFor="room-code">Room invite code</label>
        <div className="input-action">
          <input
            id="room-code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Paste your room code"
            maxLength={100}
            required
          />
          <button
            className="button secondary"
            type="submit"
            aria-label="Join room"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <p className="caption">
        {signedIn
          ? "Ready to build. Your next session starts here."
          : "Sign in to create or join a session."}
      </p>
    </div>
  );
}
