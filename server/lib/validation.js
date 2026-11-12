export const validRoomId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
export const validEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const validPassword = (value) =>
  typeof value === "string" &&
  value.length >= 8 &&
  Buffer.byteLength(value, "utf8") <= 72;
export const validUsername = (value) =>
  typeof value === "string" &&
  value.trim().length >= 2 &&
  value.trim().length <= 40 &&
  !/[\x00-\x1f\x7f]/.test(value);
export const validCode = (value) =>
  typeof value === "string" && value.length <= 100000;
export const validPosition = (value) =>
  value &&
  Number.isSafeInteger(value.lineNumber) &&
  Number.isSafeInteger(value.column) &&
  value.lineNumber > 0 &&
  value.column > 0 &&
  value.lineNumber <= 100001 &&
  value.column <= 100001;
export const executableLanguages = new Set([
  "javascript",
  "python",
  "cpp",
  "java",
]);
