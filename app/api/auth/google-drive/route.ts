import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_STATE_COOKIE } from "@/lib/auth-constants";
import {
  buildGoogleDriveSetupAuthUrl,
  createOAuthState,
  isGoogleOAuthConfigured,
} from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Configura GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET primero." },
      { status: 500 },
    );
  }

  const setupSecret = process.env.GOOGLE_DRIVE_SETUP_SECRET?.trim();
  const url = new URL(request.url);
  const provided = url.searchParams.get("secret")?.trim();

  if (setupSecret && provided !== setupSecret) {
    return NextResponse.json({ error: "Secret de configuración inválido." }, { status: 401 });
  }

  const state = createOAuthState();
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(buildGoogleDriveSetupAuthUrl(state));
}
