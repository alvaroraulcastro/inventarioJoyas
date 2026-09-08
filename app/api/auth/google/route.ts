import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_STATE_COOKIE } from "@/lib/auth-constants";
import { buildGoogleAuthUrl, createOAuthState, isGoogleOAuthConfigured } from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "Google OAuth no está configurado en el servidor.");
    return NextResponse.redirect(url);
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

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
