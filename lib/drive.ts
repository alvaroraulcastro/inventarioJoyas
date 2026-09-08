import { Readable } from "node:stream";
import { getDriveClient, getDriveFolderId } from "@/lib/google";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

export function assertValidPhoto(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("La foto debe ser JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La foto no puede superar 4 MB.");
  }
}

export async function uploadPiezaFoto(piezaId: string, file: File) {
  assertValidPhoto(file);
  const drive = getDriveClient();
  const folderId = getDriveFolderId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop() || "jpg";
  const safeName = `${piezaId}-${Date.now()}.${extension}`;

  const created = await drive.files.create({
    requestBody: {
      name: safeName,
      parents: [folderId],
    },
    media: {
      mimeType: file.type || "image/jpeg",
      body: Readable.from(buffer),
    },
    fields: "id, name, mimeType",
    supportsAllDrives: true,
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error("No se pudo guardar la foto en Google Drive.");
  }

  return fileId;
}

export async function deletePiezaFoto(fileId: string) {
  if (!fileId) return;
  const drive = getDriveClient();
  try {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error("No se pudo borrar la foto de Drive:", error);
  }
}

export async function getPiezaFoto(fileId: string) {
  const drive = getDriveClient();
  const meta = await drive.files.get({
    fileId,
    fields: "id, mimeType, name",
    supportsAllDrives: true,
  });
  const media = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "arraybuffer" },
  );

  return {
    mimeType: meta.data.mimeType || "image/jpeg",
    body: Buffer.from(media.data as ArrayBuffer),
  };
}
