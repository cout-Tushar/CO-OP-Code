import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { language, code } = await req.json();

    const response = await fetch(
      "https://emkc.org/api/v2/piston/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          version: "latest",
          files: [
            {
              name: "main",
              content: code,
            },
          ],
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    console.log(result); // check actual piston response

    if (!response.ok) {
      return NextResponse.json(
        { output: result.message || "Execution failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      output: result.run?.output || "No output",
    });

  } catch (error) {
    console.error("Execution error:", error);

    return NextResponse.json(
      { output: "Error executing code." },
      { status: 500 }
    );
  }
}
