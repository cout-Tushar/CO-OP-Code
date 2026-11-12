import { readFile, writeFile } from "node:fs/promises";
// Monaco 0.57 vendors DOMPurify, so npm overrides alone do not patch its runtime.
// Point that vendored entry at the audited installed package on every clean install/build.
const target = new URL(
  "../node_modules/monaco-editor/esm/vs/base/browser/dompurify/dompurify.js",
  import.meta.url,
);
const shim = 'export { default } from "dompurify";\n';
const source = await readFile(target, "utf8");
if (!source.startsWith("/*! @license DOMPurify") && source !== shim)
  throw new Error(
    "Monaco sanitizer changed; review the local security shim before building.",
  );
if (source !== shim) await writeFile(target, shim);
