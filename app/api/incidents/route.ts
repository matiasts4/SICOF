import { NextRequest, NextResponse } from "next/server";
import { sendToService } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_incidents";
    const terminal_id = searchParams.get("terminal_id");
    const id_bus = searchParams.get("id_bus");
    const estado = searchParams.get("estado");

    const params: Record<string, unknown> = {};
    if (terminal_id) params.terminal_id = parseInt(terminal_id, 10);
    if (id_bus) params.id_bus = parseInt(id_bus, 10);
    if (estado) params.estado = estado;

    const result = await sendToService("incid", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sendToService("incid", { action: body.action, params: body.params ?? {} });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}
