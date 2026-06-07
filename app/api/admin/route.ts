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

    // Permitir solo a administradores (TI o COF) acceder a datos administrativos
    if (user.rol !== "Admin TI" && user.rol !== "Admin COF") {
      return NextResponse.json(
        { status: "error", message: "Acceso denegado. Rol insuficiente." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") ?? "get_params";
    
    // Convert all search parameters into a params object
    const params: Record<string, string | null> = {};
    searchParams.forEach((value, key) => {
      if (key !== "action") {
        params[key] = value;
      }
    });

    const result = await sendToService("segur", { action, params });
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

    if (user.rol !== "Admin TI" && user.rol !== "Admin COF") {
      return NextResponse.json(
        { status: "error", message: "Acceso denegado. Rol insuficiente." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body.action;
    const params = body.params || {};

    if (!action) {
      return NextResponse.json({ status: "error", message: "Acción requerida" }, { status: 400 });
    }

    // Inyectar el username del operador autenticado para fines de auditoría
    params.username = user.username;
    params.username_actor = user.username;

    const result = await sendToService("segur", { action, params });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}

