import { NextResponse } from "next/server";
export async function POST(req) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 2055)
    return NextResponse.json(
      { output: "Please sign in again." },
      { status: 401 },
    );
  try {
    // Read a bounded stream, including requests without a Content-Length header.
    const reader = req.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { output: "Code is required." },
        { status: 400 },
      );
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 512000) {
        await reader.cancel();
        return NextResponse.json(
          { output: "Code is too large." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (
      !body ||
      typeof body.code !== "string" ||
      body.code.length > 100000 ||
      !["javascript", "python", "cpp", "java"].includes(body.language)
    )
      return NextResponse.json(
        { output: "Invalid code or unsupported execution language." },
        { status: 400 },
      );
    const response = await fetch(
      `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify({ language: body.language, code: body.code }),
        signal: AbortSignal.timeout(18000),
        cache: "no-store",
      },
    );
    const data = await response.json();
    return NextResponse.json(
      { output: data.output || data.msg || "No output." },
      { status: response.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        output:
          error instanceof SyntaxError
            ? "Invalid request."
            : "Unable to reach the code runner. Try again later.",
      },
      { status: error instanceof SyntaxError ? 400 : 502 },
    );
  }
}
