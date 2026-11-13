import { setTimeout as delay } from "node:timers/promises";

// Language IDs for Judge0 CE.
export const judge0Languages = new Map([
  ["javascript", 63],
  ["python", 71],
  ["cpp", 54],
  ["java", 62],
]);

export async function runJudge0({
  apiUrl,
  apiKey,
  fetchRunner,
  language,
  code,
}) {
  if (!apiUrl) throw new Error("Judge0 is not configured.");

  const base = apiUrl.replace(/\/+$/, "");
  const signal = AbortSignal.timeout(15000);
  const headers = apiKey ? { "X-Auth-Token": apiKey } : {};
  const submission = await fetchRunner(
    `${base}/submissions?base64_encoded=true`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: judge0Languages.get(language),
        source_code: Buffer.from(code, "utf8").toString("base64"),
        cpu_time_limit: 3,
        wall_time_limit: 5,
        memory_limit: 128000,
        max_file_size: 1024,
        enable_network: false,
      }),
      signal,
      redirect: "error",
    },
  );
  if (!submission.ok) throw new Error("Judge0 rejected the submission.");
  const { token } = await submission.json();
  if (typeof token !== "string" || !/^[\w-]{1,128}$/.test(token))
    throw new Error("Judge0 returned an invalid token.");

  const resultUrl = `${base}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output`;
  while (!signal.aborted) {
    const response = await fetchRunner(resultUrl, {
      headers,
      signal,
      redirect: "error",
    });
    if (!response.ok) throw new Error("Judge0 result is unavailable.");
    const result = await response.json();
    const status = result.status?.id;
    if (!Number.isInteger(status) || status < 1 || status >= 13)
      throw new Error("Judge0 returned a runner error.");
    if (status > 2) {
      const output = [result.compile_output, result.stdout, result.stderr]
        .filter((value) => typeof value === "string" && value.length)
        .map((value) => Buffer.from(value, "base64").toString("utf8"))
        .join("\n");
      return (
        output ||
        (status === 3
          ? "Execution finished without output."
          : result.status.description || "Execution failed.")
      ).slice(0, 100000);
    }
    await delay(300, undefined, { signal });
  }
  throw signal.reason;
}
