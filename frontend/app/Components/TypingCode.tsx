"use client";

import { useEffect, useRef, useState } from "react";

const source = `// A little collaboration goes a long way.

const team = ["you", "your next collaborator"];

function buildTogether(idea) {
  return team.map(developer => {
    return developer + " + " + idea;
  });
}

buildTogether("something great");`;

const tokens = source.split(
  /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\b(?:const|function|return|buildTogether|map)\b)/g,
);

export default function TypingCode() {
  const element = useRef<HTMLPreElement>(null);
  const [length, setLength] = useState(source.length);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let position = 0;
    let started = false;
    const tick = () => {
      position += 1;
      setLength(position);
      if (position < source.length) {
        timer = setTimeout(tick, source[position - 1] === "\n" ? 180 : 24);
      } else {
        setTyping(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started || motion.matches) return;
        started = true;
        setLength(0);
        setTyping(true);
        timer = setTimeout(tick, 400);
      },
      { threshold: 0.25 },
    );
    const stopForReducedMotion = () => {
      if (!motion.matches) return;
      clearTimeout(timer);
      setLength(source.length);
      setTyping(false);
    };
    if (element.current) observer.observe(element.current);
    motion.addEventListener("change", stopForReducedMotion);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      motion.removeEventListener("change", stopForReducedMotion);
    };
  }, []);

  return (
    <pre ref={element} aria-label={source}>
      <code aria-hidden="true">
        {tokens.map((token, index) => {
          const start = tokens.slice(0, index).join("").length;
          const end = start + token.length;
          const visible = Math.max(0, Math.min(token.length, length - start));
          const color = token.startsWith("//")
            ? "comment"
            : token.startsWith('"')
              ? "green"
              : /^(const|function|return)$/.test(token)
                ? "purple"
                : /^(buildTogether|map)$/.test(token)
                  ? "blue"
                  : undefined;
          return (
            <span className={color} key={index}>
              {token.slice(0, visible)}
              {typing && length >= start && length < end && (
                <span className="typing-caret" />
              )}
              <span style={{ visibility: "hidden" }}>
                {token.slice(visible)}
              </span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}
