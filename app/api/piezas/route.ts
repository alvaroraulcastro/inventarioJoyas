import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createPieza, listPiezas } from "@/lib/sheets";
import type { PiezaInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const piezas = await listPiezas();
    return NextResponse.json({ piezas });
  } catch (error) {
    return jsonError(error, "No se pudo leer el inventario.");
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const input = (await request.json()) as PiezaInput;
    const pieza = await createPieza(input);
    return NextResponse.json({ pieza }, { status: 201 });
  } catch (error) {
    return jsonError(error, "No se pudo crear la pieza.");
  }
}
