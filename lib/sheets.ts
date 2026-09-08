import { getSheetId, getSheetsClient } from "@/lib/google";
import { SHEET_HEADERS, type Pieza, type PiezaInput } from "@/lib/types";

const SHEET_TITLE = "Inventario";
const RANGE = `${SHEET_TITLE}!A:Q`;

function nowIso() {
  return new Date().toISOString();
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function rowToPieza(row: string[]): Pieza {
  const values = SHEET_HEADERS.map((_, index) => asString(row[index]));
  return {
    id: values[0],
    codigo: values[1],
    nombre: values[2],
    tipo: values[3],
    material: values[4],
    kilates: values[5],
    peso_gramos: values[6],
    talla: values[7],
    piedras: values[8],
    precio_costo: values[9],
    precio_venta: values[10],
    estado: values[11],
    ubicacion: values[12],
    fecha_ingreso: values[13],
    foto_id: values[14],
    notas: values[15],
    actualizado_en: values[16],
  };
}

function piezaToRow(pieza: Pieza) {
  return SHEET_HEADERS.map((key) => pieza[key] ?? "");
}

function normalizeInput(input: PiezaInput, current?: Pieza): Pieza {
  const nombre = asString(input.nombre);
  if (!nombre) {
    throw new Error("El nombre de la pieza es obligatorio.");
  }

  return {
    id: current?.id ?? input.id ?? crypto.randomUUID(),
    codigo: asString(input.codigo),
    nombre,
    tipo: asString(input.tipo) || "otro",
    material: asString(input.material) || "otro",
    kilates: asString(input.kilates),
    peso_gramos: asString(input.peso_gramos),
    talla: asString(input.talla),
    piedras: asString(input.piedras),
    precio_costo: asString(input.precio_costo),
    precio_venta: asString(input.precio_venta),
    estado: asString(input.estado) || "disponible",
    ubicacion: asString(input.ubicacion),
    fecha_ingreso: asString(input.fecha_ingreso) || new Date().toISOString().slice(0, 10),
    foto_id: current?.foto_id ?? asString(input.foto_id),
    notas: asString(input.notas),
    actualizado_en: nowIso(),
  };
}

async function getNumericSheetId(spreadsheetId: string) {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((item) => item.properties?.title === SHEET_TITLE);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId == null) {
    throw new Error("No se encontró la pestaña Inventario.");
  }
  return sheetId;
}

export async function ensureInventarioSheet() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((item) => item.properties?.title === SHEET_TITLE);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_TITLE } } }],
      },
    });
  }

  const header = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TITLE}!1:1`,
  });
  const firstCell = header.data.values?.[0]?.[0];

  if (firstCell !== "id") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_TITLE}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  }
}

async function readRows() {
  await ensureInventarioSheet();
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  });
  const [headers, ...rows] = result.data.values ?? [];
  if (!headers?.length) return [];
  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      pieza: rowToPieza(row.map((cell) => asString(cell))),
    }))
    .filter((item) => item.pieza.id);
}

export async function listPiezas() {
  const rows = await readRows();
  return rows
    .map((item) => item.pieza)
    .sort((a, b) => b.actualizado_en.localeCompare(a.actualizado_en));
}

export async function getPieza(id: string) {
  const rows = await readRows();
  const found = rows.find((item) => item.pieza.id === id);
  return found ?? null;
}

export async function createPieza(input: PiezaInput) {
  const pieza = normalizeInput(input);
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  await ensureInventarioSheet();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: RANGE,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [piezaToRow(pieza)] },
  });
  return pieza;
}

export async function updatePieza(id: string, input: PiezaInput) {
  const found = await getPieza(id);
  if (!found) {
    throw new Error("La pieza no existe.");
  }

  const pieza = normalizeInput(input, found.pieza);
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_TITLE}!A${found.rowNumber}:Q${found.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [piezaToRow(pieza)] },
  });
  return pieza;
}

export async function updatePiezaFoto(id: string, fotoId: string) {
  const found = await getPieza(id);
  if (!found) {
    throw new Error("La pieza no existe.");
  }

  const pieza: Pieza = {
    ...found.pieza,
    foto_id: fotoId,
    actualizado_en: nowIso(),
  };
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_TITLE}!A${found.rowNumber}:Q${found.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [piezaToRow(pieza)] },
  });
  return { previousFotoId: found.pieza.foto_id, pieza };
}

export async function deletePieza(id: string) {
  const found = await getPieza(id);
  if (!found) {
    throw new Error("La pieza no existe.");
  }

  const spreadsheetId = getSheetId();
  const sheetId = await getNumericSheetId(spreadsheetId);
  const sheets = getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: found.rowNumber - 1,
              endIndex: found.rowNumber,
            },
          },
        },
      ],
    },
  });

  return found.pieza;
}
