import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getPieza, setPiezaActiva, updatePieza } from "@/lib/sheets";
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

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "No se pueden eliminar piezas desde la aplicación. Desactívala o elimínala directamente en Google Sheets.",
    },
    { status: 403 },
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const body = (await request.json()) as { activo?: "si" | "no" };
    if (body.activo !== "si" && body.activo !== "no") {
      return NextResponse.json({ error: 'Indica activo: "si" o "no".' }, { status: 400 });
    }
    const pieza = await setPiezaActiva(id, body.activo);
    return NextResponse.json({ pieza });
  } catch (error) {
    return jsonError(error, "No se pudo actualizar el estado de la pieza.");
  }
}
