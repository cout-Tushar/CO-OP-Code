"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import Codespace from "@/app/Components/Codespace.jsx";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

// Generate consistent color for each user based on username
const generateUserColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

export default function RoomPage() {
  const { id: roomId } = useParams();
  const router = useRouter();
  const [code, setCode] = useState("// Start typing...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const timeoutRef = useRef(null);
  const cursorDecorationsRef = useRef(new Map());

  const username = localStorage.getItem("username") || "Anonymous";
  const userColor = generateUserColor(username);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join-room", { roomId, username });

    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("code-update", (newCode) => setCode(newCode));

    socket.on("chat-message", (msg) => setMessages((prev) => [...prev, msg]));

    // --- Cursor Updates ---
    socket.on("cursor-update", ({ username, color, position }) => {
      if (!window.monacoEditor || !window.monaco || !position) return;
      const editor = window.monacoEditor;
      const cursorDecorations = cursorDecorationsRef.current;

      if (cursorDecorations.has(username)) {
        editor.deltaDecorations(cursorDecorations.get(username), []);
      }

      const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, "-");
      const cursorClassName = `remote-cursor-${sanitizedUsername}`;
      const labelClassName = `cursor-label-${sanitizedUsername}`;

      let styleEl = document.getElementById(`cursor-style-${sanitizedUsername}`);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = `cursor-style-${sanitizedUsername}`;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        .${cursorClassName} {
          border-left: 2px solid ${color} !important;
        }
        .${labelClassName} {
          background: ${color} !important;
          color: #fff !important;
        }
      `;

      const newDeco = editor.deltaDecorations([], [
        {
          range: new window.monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            className: cursorClassName,
            afterContentClassName: labelClassName,
            after: {
              content: username,
              inlineClassName: labelClassName,
            },
          },
        },
      ]);

      cursorDecorations.set(username, newDeco);
    });

    return () => {
      socket.off("code-update");
      socket.off("chat-message");
      socket.off("cursor-update");
      cursorDecorationsRef.current.clear();

      const styles = document.querySelectorAll('[id^="cursor-style-"]');
      styles.forEach((style) => style.remove());
    };
  }, [roomId, username]);

  const handleChange = (value) => {
    const newValue = value || "";
    setCode(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socket.emit("code-change", { roomId, code: newValue });
    }, 200);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId, username });
    socket.disconnect();
    router.push("/");
  };

  // 🔥 RUN CODE (Backend API updated)
  const runCode = async () => {
    try {
      setOutput("⏳ Running code...");

      const res = await fetch(
        `/api/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code }),
        }
      );

      const data = await res.json();
      setOutput(data.output || "No output received.");
    } catch (err) {
      setOutput("❌ Error executing code.");
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const extensions = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      java: "java",
      html: "html",
      css: "css",
    };

    a.download = `code.${extensions[language] || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socket.emit("chat-message", { roomId, text: newMessage, username });
    setMessages((prev) => [...prev, { text: newMessage, self: true, username }]);
    setNewMessage("");
  };

  return (
    <>
      <Codespace />
      <div className="bg-gray-800 flex h-screen text-white overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex flex-col w-2/3 p-4">
          {/* Toolbar */}
          <div className="flex justify-center items-center gap-5 mb-3">
            <button onClick={runCode} title="Run Code">
              <img
                src="/play-button.png"
                alt="run"
                className="h-[25px] p-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
              />
            </button>

            <button onClick={() => setCode("// Start typing...")} title="Clear Code">
              <img
                src="/reload.png"
                alt="reload"
                className="h-[25px] p-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
              />
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(code)}
              title="Copy Code"
            >
              <img
                src="/copy.png"
                alt="copy"
                className="h-[25px] p-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
              />
            </button>

            <button
              onClick={downloadCode}
              title="Download Code"
              className="h-[25px] w-[25px] p-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
            >
              <img src="/download.png" alt="download" />
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm hover:bg-gray-600 cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>

            <button
              onClick={handleLeaveRoom}
              className="ml-auto bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-semibold transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 rounded-2xl p-3 bg-gray-900 border border-gray-700 shadow-lg shadow-purple-500/10">
            <Editor
              height="100%"
              width="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleChange}
              onMount={(editor, monaco) => {
                window.monacoEditor = editor;
                window.monaco = monaco;

                editor.onDidChangeCursorPosition((e) => {
                  const position = e.position;
                  socket.emit("cursor-move", {
                    roomId,
                    username,
                    color: userColor,
                    position,
                  });
                });
              }}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output */}
          <div className="h-[200px] rounded-2xl p-4 bg-gray-900 mt-4 border border-gray-700 shadow-lg shadow-purple-500/10 text-gray-200 font-mono">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">Output:</h2>
            <pre className="whitespace-pre-wrap break-words">{output}</pre>
          </div>
        </div>

        {/* Chat */}
        <div className="w-1/3 h-[560px] my-auto rounded-xl mx-auto bg-gray-900 p-5 border-l border-gray-700 shadow-lg shadow-purple-500/10 flex flex-col justify-between">
          <h2 className="text-lg font-bold mb-3 text-purple-400">💬 Chat</h2>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet.</p>
            ) : (
              messages.map((msg, idx) => {
                if (msg.system) {
                  return (
                    <div key={idx} className="text-center text-gray-400 italic text-sm">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.self
                        ? "bg-purple-600/40 self-end ml-auto"
                        : "bg-gray-700 self-start"
                    }`}
                  >
                    <p className="text-xs text-gray-400 mb-1">
                      {msg.self ? "You" : msg.username || "Anonymous"}
                    </p>
                    {msg.text}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
