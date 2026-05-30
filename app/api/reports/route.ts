import { NextRequest, NextResponse } from "next/server";
import { sendToService } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_kpis";
    const terminal_id = searchParams.get("terminal_id");
    const format = searchParams.get("format");

    const params: Record<string, unknown> = {};
    if (terminal_id) params.terminal_id = parseInt(terminal_id, 10);
    if (format) params.format = format;

    const result = await sendToService("repor", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}
