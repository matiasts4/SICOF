import { NextRequest, NextResponse } from "next/server";
import { sendToService } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_intervals";
    const terminal_id = searchParams.get("terminal_id");
    const route_id = searchParams.get("route_id");

    const params: Record<string, unknown> = {};
    if (terminal_id) params.terminal_id = parseInt(terminal_id, 10);
    if (route_id) params.route_id = parseInt(route_id, 10);

    const result = await sendToService("frecu", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}
