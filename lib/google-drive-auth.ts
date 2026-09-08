import { google } from "googleapis";
import { getGoogleOAuthConfig } from "@/lib/google-oauth";

export function isDriveOAuthConfigured() {
  return Boolean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim());
}

export function getDriveOAuth2Client() {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    throw new Error(
      "Falta GOOGLE_DRIVE_REFRESH_TOKEN. Las cuentas de servicio no pueden subir fotos a un Drive personal; configura un token OAuth del dueño de la carpeta.",
    );
  }

  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getDriveOAuth2Client() });
}
