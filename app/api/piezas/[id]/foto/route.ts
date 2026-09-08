import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { deletePiezaFoto, uploadPiezaFoto } from "@/lib/drive";
import { updatePiezaFoto } from "@/lib/sheets";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("foto");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Debes adjuntar una foto." }, { status: 400 });
    }

    const fotoId = await uploadPiezaFoto(id, file);
    const { previousFotoId, pieza } = await updatePiezaFoto(id, fotoId);

    if (previousFotoId && previousFotoId !== fotoId) {
      await deletePiezaFoto(previousFotoId);
    }

    return NextResponse.json({ pieza });
  } catch (error) {
    return jsonError(error, "No se pudo guardar la foto.");
  }
}
