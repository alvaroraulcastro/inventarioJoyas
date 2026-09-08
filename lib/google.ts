import { google } from "googleapis";

function normalizePrivateKey(raw: string) {
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  return key;
}

export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = process.env.GOOGLE_PRIVATE_KEY
    ? normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY)
    : undefined;

  if (!email || !key) {
    throw new Error(
      "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY. Configura la cuenta de servicio.",
    );
  }

  if (!key.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY no tiene formato PEM válido. Copia el campo private_key completo del JSON.",
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

export function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Falta GOOGLE_SHEET_ID.");
  }
  return id;
}

export function getDriveFolderId() {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) {
    throw new Error("Falta GOOGLE_DRIVE_FOLDER_ID.");
  }
  return id;
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getGoogleAuth() });
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getGoogleAuth() });
}
