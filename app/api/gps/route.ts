import { NextRequest, NextResponse } from "next/server";
import { sendToService, authenticateRequest } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "No autorizado. Token inválido o ausente." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_fleet_positions";
    const terminal_id_str = searchParams.get("terminal_id");
    const id_bus_str = searchParams.get("id_bus");

    const terminal_id = terminal_id_str ? parseInt(terminal_id_str, 10) : null;
    const id_bus = id_bus_str ? parseInt(id_bus_str, 10) : null;

    // Control de acceso por terminal (RF-003):
    if (
      user.rol !== "Admin COF" &&
      user.rol !== "Admin TI" &&
      user.terminal_id !== null &&
      terminal_id !== null &&
      user.terminal_id !== terminal_id
    ) {
      return NextResponse.json(
        { status: "error", message: "Acceso denegado a este terminal." },
        { status: 403 }
      );
    }

    const params: Record<string, unknown> = {};
    if (user.rol !== "Admin COF" && user.rol !== "Admin TI" && user.terminal_id !== null) {
      params.terminal_id = user.terminal_id;
    } else if (terminal_id !== null) {
      params.terminal_id = terminal_id;
    }
    if (id_bus !== null) params.id_bus = id_bus;

    const result = await sendToService("gpssv", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "No autorizado. Token inválido o ausente." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const params = body.params ?? {};

    // Restringir por terminal para usuarios no globales (RF-003)
    if (user.rol !== "Admin COF" && user.rol !== "Admin TI" && user.terminal_id !== null) {
      params.terminal_id = user.terminal_id;
    }

    const result = await sendToService("gpssv", { action: body.action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}

