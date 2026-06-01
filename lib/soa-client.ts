/**
 * soa-client.ts — Cliente SOA para Node.js (Next.js API Routes)
 *
 * Conecta al BUS TCP y envía/recibe mensajes usando el protocolo SOA:
 *   [LONGITUD(5)][SERVICIO(5)][PAYLOAD]
 *
 * Uso desde API routes:
 *   import { sendToService } from "@/lib/soa-client";
 *   const result = await sendToService("flota", { action: "get_buses", params: { terminal_id: 1 } });
 */

import * as net from "net";

const SOA_BUS_HOST = process.env.SOA_BUS_HOST ?? "localhost";
const SOA_BUS_PORT = parseInt(process.env.SOA_BUS_PORT ?? "5000", 10);
const TIMEOUT_MS = 10_000; // 10 segundos

/**
 * Envía un mensaje JSON a un servicio SOA a través del BUS y espera la respuesta.
 *
 * @param serviceName - Nombre del servicio (5 caracteres: "flota", "segur", etc.)
 * @param payload - Objeto JSON con la acción y parámetros
 * @returns Promise con el objeto de respuesta del servicio
 */
export async function sendToService(
  serviceName: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket();
    let responseBuffer = Buffer.alloc(0);
    let expectedLength: number | null = null;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        sock.destroy();
        reject(new Error(`Timeout: servicio '${serviceName}' no respondió en ${TIMEOUT_MS}ms`));
      }
    }, TIMEOUT_MS);

    sock.connect(SOA_BUS_PORT, SOA_BUS_HOST, () => {
      // Preparar el mensaje
      const svc = serviceName.slice(0, 5).padEnd(5, " ");
      const payloadStr = JSON.stringify(payload);
      const body = svc + payloadStr;
      const bodyBuffer = Buffer.from(body, "utf-8");
      const lengthHeader = bodyBuffer.length.toString().padStart(5, "0");
      const message = Buffer.concat([Buffer.from(lengthHeader, "utf-8"), bodyBuffer]);

      sock.write(message);
    });

    sock.on("data", (chunk: Buffer) => {
      responseBuffer = Buffer.concat([responseBuffer, chunk]);

      // Leer longitud si todavía no la tenemos
      if (expectedLength === null && responseBuffer.length >= 5) {
        expectedLength = parseInt(responseBuffer.subarray(0, 5).toString("utf-8"), 10);
      }

      // Verificar si tenemos el mensaje completo
      if (expectedLength !== null && responseBuffer.length >= 5 + expectedLength) {
        clearTimeout(timer);
        if (settled) return;
        settled = true;

        const body = responseBuffer.subarray(5, 5 + expectedLength);
        const payloadStr = body.subarray(5).toString("utf-8");

        sock.destroy();

        try {
          const data = JSON.parse(payloadStr);
          resolve(data);
        } catch {
          resolve({ status: "error", message: "Respuesta no es JSON válido", raw: payloadStr });
        }
      }
    });

    sock.on("error", (err: Error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(new Error(`Error de conexión al BUS: ${err.message}`));
      }
    });

    sock.on("close", () => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(new Error("Conexión cerrada antes de recibir respuesta"));
      }
    });
  });
}

/**
 * Helper para verificar si el BUS está disponible.
 */
export async function isBusAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    const timer = setTimeout(() => {
      sock.destroy();
      resolve(false);
    }, 2000);

    sock.connect(SOA_BUS_PORT, SOA_BUS_HOST, () => {
      clearTimeout(timer);
      sock.destroy();
      resolve(true);
    });

    sock.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  terminal_id: number | null;
}

export async function authenticateRequest(
  request: Request,
): Promise<AuthenticatedUser | null> {
  let token: string | null = null;

  // 1. Intentar leer de cabecera Authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Si no está en Authorization, intentar leer de las Cookies
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/sicof_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return null;
  }

  try {
    const result = await sendToService("segur", {
      action: "validate",
      params: { token }
    });
    if (result.status === "ok" && result.user) {
      return result.user as AuthenticatedUser;
    }
  } catch (error) {
    console.error("Error en validación de token:", error);
  }
  return null;
}
