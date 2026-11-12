"use client";
import Brand from "./Brand";
import { Copy, LogOut } from "lucide-react";
export default function Codespace({ roomId, onCopy, onLeave, onSignOut }) {
  return (
    <header className="workspace-header">
      <Brand
        onNavigate={(event) => {
          event.preventDefault();
          onLeave();
        }}
      />
      <span className="room-tag" title={roomId}>
        room / {roomId}
      </span>
      <div className="workspace-header-actions">
        <button className="button secondary" onClick={onCopy}>
          <Copy size={15} /> Copy invite
        </button>
        <button className="button secondary" onClick={onLeave}>
          <LogOut size={15} /> Leave room
        </button>
        <button className="button secondary signout-button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
