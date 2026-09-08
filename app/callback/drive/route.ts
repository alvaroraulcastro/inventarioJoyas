import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAUTH_STATE_COOKIE } from "@/lib/auth-constants";
import { exchangeCodeForDriveTokens } from "@/lib/google-oauth";

export const runtime = "nodejs";

function htmlPage(title: string, body: string) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.5}
    code,pre{background:#f5f0e8;padding:12px;border-radius:8px;display:block;overflow:auto;word-break:break-all}
    h1{font-size:1.5rem}</style></head><body>${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return htmlPage(
      "Error Drive OAuth",
      `<h1>No se pudo autorizar Drive</h1><p>Intenta de nuevo desde <code>/api/auth/google-drive</code>.</p>`,
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return htmlPage(
      "Drive OAuth",
      `<h1>Respuesta inválida</h1><p>Falta el código de autorización.</p>`,
    );
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
    return htmlPage(
      "Drive OAuth",
      `<h1>Estado inválido</h1><p>Vuelve a abrir <code>/api/auth/google-drive</code> y autoriza de nuevo.</p>`,
    );
  }

  try {
    const tokens = await exchangeCodeForDriveTokens(code);
    if (!tokens.refresh_token) {
      return htmlPage(
        "Drive OAuth",
        `<h1>No se recibió refresh token</h1>
        <p>Revoca el acceso de la app en tu cuenta Google y repite el proceso.</p>
        <p><a href="https://myaccount.google.com/permissions">Gestionar permisos de Google</a></p>`,
      );
    }

    return htmlPage(
      "Token de Drive",
      `<h1>Copia este valor en Vercel</h1>
      <p>Variable: <strong>GOOGLE_DRIVE_REFRESH_TOKEN</strong></p>
      <pre>${tokens.refresh_token}</pre>
      <p>Usa la cuenta Google que es dueña de la carpeta de fotos. Luego redeploy en Vercel.</p>`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return htmlPage("Error Drive OAuth", `<h1>Error</h1><p>${message}</p>`);
  }
}
