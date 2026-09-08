import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { deletePiezaFoto } from "@/lib/drive";
import { deletePieza, getPieza, updatePieza } from "@/lib/sheets";
import type { PiezaInput } from "@/lib/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const found = await getPieza(id);
    if (!found) {
      return NextResponse.json({ error: "La pieza no existe." }, { status: 404 });
    }
    return NextResponse.json({ pieza: found.pieza });
  } catch (error) {
    return jsonError(error, "No se pudo obtener la pieza.");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const input = (await request.json()) as PiezaInput;
    const pieza = await updatePieza(id, input);
    return NextResponse.json({ pieza });
  } catch (error) {
    return jsonError(error, "No se pudo actualizar la pieza.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const pieza = await deletePieza(id);
    if (pieza.foto_id) {
      await deletePiezaFoto(pieza.foto_id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "No se pudo eliminar la pieza.");
  }
}
