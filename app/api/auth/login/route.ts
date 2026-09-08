import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, validateCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Ingresa usuario y contraseña." },
      { status: 400 },
    );
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(username);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
