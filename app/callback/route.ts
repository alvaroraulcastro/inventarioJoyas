import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { OAUTH_STATE_COOKIE } from "@/lib/auth-constants";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  isAllowedGoogleEmail,
} from "@/lib/google-oauth";

export const runtime = "nodejs";

function loginRedirect(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return loginRedirect(request, "No se pudo completar el inicio de sesión con Google.");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return loginRedirect(request, "La respuesta de Google es inválida.");
  }

  const store = await cookies();
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;
  store.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  if (!expectedState || expectedState !== state) {
    return loginRedirect(request, "La sesión de Google expiró. Intenta de nuevo.");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!isAllowedGoogleEmail(profile.email)) {
      return loginRedirect(request, "Esta cuenta de Google no tiene acceso al inventario.");
    }

    const sessionLabel = profile.name || profile.email;
    const token = await createSessionToken(sessionLabel);
    await setSessionCookie(token);

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo iniciar sesión con Google.";
    return loginRedirect(request, message);
  }
}
