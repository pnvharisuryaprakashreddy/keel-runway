import { NextResponse } from "next/server";
import { parseSimulate, runIngest } from "@/lib/ingest/run";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const simulate = parseSimulate(url.searchParams.get("simulate"));
  const force = url.searchParams.get("force") === "1";
  const result = await runIngest({ simulate, force });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": simulate || force ? "no-store" : "public, max-age=30",
    },
  });
}
