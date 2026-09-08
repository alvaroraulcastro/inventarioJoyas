import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getPiezaFoto } from "@/lib/drive";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const foto = await getPiezaFoto(id);
    return new NextResponse(new Uint8Array(foto.body), {
      headers: {
        "Content-Type": foto.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return jsonError(error, "No se pudo obtener la foto.");
  }
}
