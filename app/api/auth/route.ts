import { NextRequest, NextResponse } from "next/server";
import { sendToService } from "@/lib/soa-client";

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
