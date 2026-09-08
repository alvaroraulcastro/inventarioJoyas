import { NextResponse } from "next/server";
import { isUnauthorized } from "@/lib/auth";

export function jsonError(error: unknown, fallback = "Ocurrió un error inesperado.") {
  if (isUnauthorized(error)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const raw = error instanceof Error ? error.message : fallback;
  let message = raw;
  let status = raw.includes("no existe") ? 404 : 400;

  if (/invalid_grant|invalid_client|DECODER|PEM/i.test(raw)) {
    message =
      "La cuenta de servicio de Google no es válida. Revisa GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY.";
    status = 500;
  } else if (/permission|403|insufficient/i.test(raw)) {
    message =
      "La cuenta de servicio no tiene permiso. Comparte la hoja y la carpeta de Drive como Editor.";
    status = 500;
  } else if (/Falta |cuenta de servicio/i.test(raw)) {
    status = 500;
  }

  return NextResponse.json({ error: message }, { status });
}
