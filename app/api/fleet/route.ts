import { NextRequest, NextResponse } from "next/server";
import { sendToService } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_buses";
    const terminal_id = searchParams.get("terminal_id");

    const params: Record<string, unknown> = {};
    if (terminal_id) params.terminal_id = parseInt(terminal_id, 10);

    const result = await sendToService("flota", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { status: "error", message: `Error SOA: ${message}` },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json({ status: "error", message: "'action' requerido" }, { status: 400 });
    }

    const result = await sendToService("flota", { action, params: params ?? {} });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}
