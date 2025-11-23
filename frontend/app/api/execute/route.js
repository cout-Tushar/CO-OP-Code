import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { language, code } = await req.json();

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: "*",
        files: [{ content: code }],
      }),
      cache: "no-store",
    });

    const result = await response.json();
    return NextResponse.json({ output: result.run.output });
  } catch (error) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { output: "Error executing code." },
      { status: 500 }
    );
  }
}
