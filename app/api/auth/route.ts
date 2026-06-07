import { NextRequest, NextResponse } from "next/server";
import { sendToService, authenticateRequest } from "@/lib/soa-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // GET /api/auth?action=get_my_permissions — cualquier usuario autenticado puede llamar esto
    if (action === "get_my_permissions") {
      const user = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
      }
      // Obtener la matriz completa y filtrar solo el rol del usuario
      const result = await sendToService("segur", { action: "get_permissions_matrix", params: {} });
      if (result.status === "ok" && result.data) {
        const rolePerms = Object.entries(result.data as Record<string, { roles: string[] }>)
          .filter(([, detail]) => detail.roles.includes(user.rol))
          .map(([code]) => code);
        return NextResponse.json({ status: "ok", data: rolePerms });
      }
      return NextResponse.json({ status: "ok", data: [] });
    }

    return NextResponse.json({ status: "error", message: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ status: "error", message: `Error SOA: ${message}` }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { status: "error", message: "Campo 'action' requerido" },
        { status: 400 },
      );
    }

    const result = await sendToService("segur", { action, params: params ?? {} });
    const httpStatus = result.status === "ok" ? 200 : 401;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { status: "error", message: `Error de comunicación SOA: ${message}` },
      { status: 503 },
    );
  }
}
