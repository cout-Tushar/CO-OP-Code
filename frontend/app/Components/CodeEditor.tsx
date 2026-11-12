"use client";
import Editor, { loader, type EditorProps } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
// Bundle the audited editor and workers locally; no runtime CDN dependency.
self.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === "typescript" || label === "javascript")
      return new Worker(
        new URL(
          "monaco-editor/language/typescript/ts.worker.js",
          import.meta.url,
        ),
        { type: "module" },
      );
    if (label === "html")
      return new Worker(
        new URL("monaco-editor/language/html/html.worker.js", import.meta.url),
        { type: "module" },
      );
    if (label === "css")
      return new Worker(
        new URL("monaco-editor/language/css/css.worker.js", import.meta.url),
        { type: "module" },
      );
    return new Worker(
      new URL("monaco-editor/editor/editor.worker.js", import.meta.url),
      { type: "module" },
    );
  },
};
loader.config({ monaco });
export default function CodeEditor(props: EditorProps) {
  return <Editor {...props} />;
}
