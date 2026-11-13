"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import {
  Copy,
  Download,
  RotateCcw,
  Play,
  Send,
  MessageSquare,
  Terminal,
} from "lucide-react";
import Codespace from "@/app/Components/Codespace";
import { API_URL } from "@/lib/api";
import { signOut } from "@/lib/session";
const Editor = dynamic(() => import("@/app/Components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="editor-loading" role="status">
      Loading your editor…
    </div>
  ),
});
const INITIAL_CODE = "// Start typing...";
const extensions = {
  javascript: "js",
  python: "py",
  cpp: "cpp",
  java: "java",
  html: "html",
  css: "css",
};
const editorOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
  padding: { top: 20 },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  ariaLabel: "Shared code editor",
};
export default function RoomPage() {
  const { id: roomId } = useParams();
  const router = useRouter();
  const [code, setCode] = useState(INITIAL_CODE);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Connecting…");
  const [notice, setNotice] = useState("");
  const [running, setRunning] = useState(false);
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const timerRef = useRef(null);
  const cursorRef = useRef(null);
  const decorationsRef = useRef(new Map());
  const pendingRef = useRef(null);
  const codeRef = useRef(INITIAL_CODE);
  const runRef = useRef(null);
  const chatEnd = useRef(null);
  const applyingRemote = useRef(false);
  const revisionRef = useRef(0);
  const inFlightRef = useRef(false);
  function appendMessage(message) {
    setMessages((previous) => [...previous.slice(-199), message]);
  }
  useEffect(() => {
    if (!roomId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/signin?next=${encodeURIComponent(`/room/${roomId}`)}`);
      return;
    }
    const socket = io(API_URL, { auth: { token }, autoConnect: false });
    socketRef.current = socket;
    const decorations = decorationsRef.current;
    const apply = (value) => {
      applyingRemote.current = true;
      codeRef.current = value;
      setCode(value);
      if (editorRef.current && editorRef.current.getValue() !== value)
        editorRef.current.setValue(value);
      applyingRemote.current = false;
    };
    const join = () => {
      setStatus("Joining room…");
      socket.timeout(10000).emit("join-room", { roomId }, (error, response) => {
        if (error || !response?.ok) {
          setConnected(false);
          setStatus("Unable to join");
          setNotice(
            response?.msg || "The room could not be loaded. Try reconnecting.",
          );
          return;
        }
        setConnected(true);
        setStatus("Connected · Saved");
        if (pendingRef.current !== null) {
          setNotice(
            "You have unsaved local edits. Copy or download them before reloading the room.",
          );
          setStatus("Connected · Unsaved local changes");
        }
      });
    };
    socket.on("connect", join);
    socket.on("disconnect", () => {
      setConnected(false);
      setStatus("Disconnected · Reconnecting…");
      clearTimeout(timerRef.current);
    });
    socket.on("connect_error", (error) => {
      setConnected(false);
      setStatus("Connection failed");
      setNotice(
        error.message === "Unauthorized"
          ? "Your session has expired. Sign out and sign in again."
          : "Unable to connect to the room server. Check your connection and retry.",
      );
    });
    socket.on("code-update", (value) => {
      if (pendingRef.current === null && !inFlightRef.current) apply(value);
      else
        setNotice(
          "Another edit arrived while yours was pending. Download your code before reloading to compare changes.",
        );
    });
    socket.on("chat-message", appendMessage);
    socket.on("room-error", ({ msg }) => {
      setNotice(msg);
      setStatus("Save failed");
    });
    socket.on("cursor-update", ({ username, position }) => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco || !position) return;
      const previous = decorations.get(username) || [];
      const ids = editor.deltaDecorations(previous, [
        {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column,
          ),
          options: {
            className: "remote-cursor",
            after: {
              content: username,
              inlineClassName: "remote-cursor-label",
            },
            hoverMessage: { value: username },
          },
        },
      ]);
      decorations.set(username, ids);
    });
    socket.on("cursor-remove", ({ username }) => {
      const ids = decorations.get(username);
      if (ids && editorRef.current) editorRef.current.deltaDecorations(ids, []);
      decorations.delete(username);
    });
    const beforeUnload = (event) => {
      if (pendingRef.current !== null || inFlightRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const onStorage = () => {
      if (!localStorage.getItem("token")) {
        socket.disconnect();
        router.replace("/signin");
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("storage", onStorage);
    socket.connect();
    return () => {
      clearTimeout(timerRef.current);
      runRef.current?.abort();
      cursorRef.current?.dispose();
      socket.disconnect();
      socketRef.current = null;
      decorations.clear();
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("storage", onStorage);
    };
  }, [roomId, router]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  function save(value, revision) {
    if (value.length > 100000) {
      setNotice(
        "Shorten the document to 100,000 characters before saving. You can still download the full local copy.",
      );
      return;
    }
    const socket = socketRef.current;
    if (!socket?.connected) return;
    inFlightRef.current = true;
    socket
      .timeout(10000)
      .emit("code-change", { roomId, code: value }, (error, response) => {
        inFlightRef.current = false;
        if (error || !response?.ok) {
          setNotice(
            response?.msg ||
              "Could not save. Download a copy, then retry your connection.",
          );
          setStatus("Unsaved changes");
        } else if (revision === revisionRef.current) {
          pendingRef.current = null;
          setStatus("Connected · Saved");
        }
      });
  }
  function change(value) {
    if (applyingRemote.current || value === codeRef.current) return;
    const text = value || "";
    codeRef.current = text;
    setCode(text);
    pendingRef.current = text;
    const revision = ++revisionRef.current;
    clearTimeout(timerRef.current);
    if (text.length > 100000) {
      setStatus("Unsaved changes · Document too large");
      setNotice(
        "The document limit is 100,000 characters. Download a copy and shorten the document.",
      );
      return;
    }
    setStatus("Connected · Saving…");
    timerRef.current = setTimeout(() => save(text, revision), 300);
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice(
        "Clipboard access is unavailable. Select and copy the text manually.",
      );
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([codeRef.current], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `code.${extensions[language]}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function leave(logout = false) {
    if (
      (pendingRef.current !== null || inFlightRef.current) &&
      !window.confirm(
        "Some edits are not saved. Leave anyway? Download a copy first to keep them.",
      )
    )
      return;
    if (logout) signOut();
    router.push("/");
  }
  async function run() {
    if (running) return;
    setRunning(true);
    setOutput("");
    const controller = new AbortController();
    runRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ language, code: codeRef.current }),
        signal: controller.signal,
      });
      const data = await response.json();
      setOutput(data.output || "Execution finished without output.");
    } catch {
      if (!controller.signal.aborted)
        setOutput("Could not execute code. Please retry.");
      else setOutput("Execution timed out or was cancelled.");
    } finally {
      clearTimeout(timer);
      setRunning(false);
      runRef.current = null;
    }
  }
  function send(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !connected) return;
    setDraft("");
    socketRef.current
      .timeout(5000)
      .emit("chat-message", { roomId, text }, (error, response) => {
        if (error || !response?.ok) {
          setNotice(
            response?.msg || "Message was not delivered. Please try again.",
          );
          setDraft((current) => current || text);
        } else appendMessage({ text, self: true, username: "You" });
      });
  }
  return (
    <div className="workspace">
      <h1 className="sr-only">Collaborative coding room</h1>
      <Codespace
        roomId={roomId}
        onCopy={() => copy(roomId)}
        onLeave={() => leave()}
        onSignOut={() => leave(true)}
      />
      {notice && (
        <div className="workspace-notice" role="status">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="workspace-grid">
        <div className="editor-column">
          <div className="editor-toolbar">
            <select
              aria-label="Programming language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(extensions).map((value) => (
                <option key={value} value={value}>
                  {
                    {
                      javascript: "JavaScript",
                      python: "Python",
                      cpp: "C++",
                      java: "Java",
                      html: "HTML",
                      css: "CSS",
                    }[value]
                  }
                </option>
              ))}
            </select>
            <span
              className={`workspace-status ${connected ? "" : "offline"}`}
              role="status"
            >
              {status}
            </span>
            {connected && status.includes("Unsaved") && (
              <button
                className="button secondary"
                onClick={() => save(codeRef.current, revisionRef.current)}
              >
                Retry save
              </button>
            )}
            {!connected && (
              <button
                className="button secondary"
                onClick={() => {
                  socketRef.current?.disconnect();
                  socketRef.current?.connect();
                }}
              >
                Retry
              </button>
            )}
            <button
              className="icon-button"
              title="Reset shared code"
              aria-label="Reset shared code"
              disabled={!connected}
              onClick={() => {
                if (
                  window.confirm(
                    "Reset the shared document for everyone in this room?",
                  )
                )
                  change(INITIAL_CODE);
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="icon-button"
              title="Copy code"
              aria-label="Copy code"
              onClick={() => copy(code)}
            >
              <Copy size={16} />
            </button>
            <button
              className="icon-button"
              title="Download code"
              aria-label="Download code"
              onClick={download}
            >
              <Download size={16} />
            </button>
            <button
              className="button primary"
              disabled={
                running || !connected || ["html", "css"].includes(language)
              }
              onClick={run}
            >
              <Play size={14} />
              {running ? "Running…" : "Run code"}
            </button>
          </div>
          <div className="editor-container">
            <Editor
              language={language}
              theme="vs-dark"
              value={code}
              onChange={change}
              loading={
                <div className="editor-loading" role="status">
                  Loading your editor…
                </div>
              }
              options={{ ...editorOptions, readOnly: !connected }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
                cursorRef.current?.dispose();
                let last = 0;
                cursorRef.current = editor.onDidChangeCursorPosition(
                  ({ position }) => {
                    if (Date.now() - last < 80) return;
                    last = Date.now();
                    socketRef.current?.volatile.emit("cursor-move", {
                      roomId,
                      position,
                    });
                  },
                );
              }}
            />
          </div>
          <section className="output-panel" aria-label="Code output">
            <div className="panel-heading">
              <span>
                <Terminal
                  size={13}
                  style={{ display: "inline", marginRight: 8 }}
                />
                OUTPUT
              </span>
              <span>
                {language === "html" || language === "css"
                  ? "Edit & download"
                  : "Execution results"}
              </span>
            </div>
            <pre aria-live="polite">
              {running
                ? "Running your code…"
                : output ||
                  "Ready when you are. Run your code to see the result here."}
            </pre>
          </section>
        </div>
        <aside className="chat-panel">
          <div className="chat-header">
            <h2>
              <MessageSquare size={16} /> Room conversation
            </h2>
            <p>Talk it through. Build it together.</p>
          </div>
          <div
            className="chat-messages"
            role="log"
            aria-label="Room messages"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="chat-empty">
                <MessageSquare size={30} />
                <h3>Start the conversation.</h3>
                <p>Share an idea, ask a question, or say hello to your team.</p>
              </div>
            ) : (
              messages.map((message, index) =>
                message.system ? (
                  <p className="system-message" key={index}>
                    {message.text}
                  </p>
                ) : (
                  <div
                    className={`chat-message ${message.self ? "self" : ""}`}
                    key={index}
                  >
                    <strong>{message.self ? "You" : message.username}</strong>
                    {message.text}
                  </div>
                ),
              )
            )}
            <div ref={chatEnd} />
          </div>
          <form className="chat-compose" onSubmit={send}>
            <input
              aria-label="Message to room"
              placeholder="Message your team…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              disabled={!connected}
            />
            <button
              className="button primary"
              aria-label="Send message"
              disabled={!connected || !draft.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      </div>
      <div className="workspace-signature">co-op / code</div>
    </div>
  );
}
