import { getSheetId, getSheetsClient } from "@/lib/google";
import {
  LEGACY_SHEET_HEADERS,
  SHEET_HEADERS,
  isPiezaActiva,
  type Pieza,
  type PiezaInput,
} from "@/lib/types";

const SHEET_TITLE = "Inventario";
const RANGE = `${SHEET_TITLE}!A:S`;

function nowIso() {
  return new Date().toISOString();
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function headersMatch(row: string[], expected: readonly string[]) {
  return expected.every((header, index) => asString(row[index]) === header);
}

function rowToPieza(row: string[], headers: readonly string[]) {
  const get = (key: (typeof SHEET_HEADERS)[number]) => {
    const index = headers.indexOf(key);
    return index >= 0 ? asString(row[index]) : "";
  };

  return {
    id: get("id"),
    codigo: get("codigo"),
    nombre: get("nombre"),
    tipo: get("tipo"),
    material: get("material"),
    kilates: get("kilates"),
    peso_gramos: get("peso_gramos"),
    talla: get("talla"),
    piedras: get("piedras"),
    precio_costo: get("precio_costo"),
    precio_venta: get("precio_venta"),
    stock: get("stock") || "1",
    estado: get("estado"),
    ubicacion: get("ubicacion"),
    fecha_ingreso: get("fecha_ingreso"),
    foto_id: get("foto_id"),
    notas: get("notas"),
    activo: get("activo") || "si",
    actualizado_en: get("actualizado_en"),
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

  const stock = asString(input.stock);
  const stockNumber = Number(stock.replace(",", "."));
  if (stock && Number.isNaN(stockNumber)) {
    throw new Error("El stock debe ser un número válido.");
  }

  const activo = asString(input.activo).toLowerCase() || "si";
  if (!["si", "no"].includes(activo)) {
    throw new Error('El campo activo debe ser "si" o "no".');
  }

  return {
    id: current?.id ?? input.id ?? crypto.randomUUID(),
    codigo: asString(input.codigo),
    nombre,
    tipo: asString(input.tipo) || "otro",
    material: asString(input.material) || "acero",
    kilates: asString(input.kilates),
    peso_gramos: asString(input.peso_gramos),
    talla: asString(input.talla),
    piedras: asString(input.piedras),
    precio_costo: asString(input.precio_costo),
    precio_venta: asString(input.precio_venta),
    stock: stock || "1",
    estado: asString(input.estado) || "disponible",
    ubicacion: asString(input.ubicacion),
    fecha_ingreso: asString(input.fecha_ingreso) || new Date().toISOString().slice(0, 10),
    foto_id: current?.foto_id ?? asString(input.foto_id),
    notas: asString(input.notas),
    activo: activo,
    actualizado_en: nowIso(),
  };
}

async function readSheetValues() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  });
  return result.data.values ?? [];
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

  const values = await readSheetValues();
  const headerRow = values[0]?.map((cell) => asString(cell)) ?? [];
  const firstCell = headerRow[0];

  if (firstCell !== "id") {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_TITLE}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
    return;
  }

  if (headersMatch(headerRow, SHEET_HEADERS)) {
    return;
  }

  const dataRows = values.slice(1);
  const migratedRows = dataRows
    .filter((row) => asString(row[0]))
    .map((row) => piezaToRow(rowToPieza(row.map((cell) => asString(cell)), headerRow)));

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_TITLE}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[...SHEET_HEADERS], ...migratedRows],
    },
  });
}

async function readRows() {
  await ensureInventarioSheet();
  const values = await readSheetValues();
  const [headerRow, ...rows] = values;
  const headers = headerRow?.map((cell) => asString(cell)) ?? [];
  if (!headers.length) return [];

  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      pieza: rowToPieza(row.map((cell) => asString(cell)), headers),
    }))
    .filter((item) => item.pieza.id);
}

export async function listPiezas() {
  const rows = await readRows();
  return rows.map((item) => item.pieza);
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
    range: `${SHEET_TITLE}!A${found.rowNumber}:S${found.rowNumber}`,
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
    range: `${SHEET_TITLE}!A${found.rowNumber}:S${found.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [piezaToRow(pieza)] },
  });
  return { previousFotoId: found.pieza.foto_id, pieza };
}

export async function setPiezaActiva(id: string, activo: "si" | "no") {
  const found = await getPieza(id);
  if (!found) {
    throw new Error("La pieza no existe.");
  }

  if (activo === "no" && !isPiezaActiva(found.pieza.activo)) {
    throw new Error("La pieza ya está desactivada.");
  }
  if (activo === "si" && isPiezaActiva(found.pieza.activo)) {
    throw new Error("La pieza ya está activa.");
  }

  const pieza: Pieza = {
    ...found.pieza,
    activo,
    actualizado_en: nowIso(),
  };

  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_TITLE}!A${found.rowNumber}:S${found.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [piezaToRow(pieza)] },
  });

  return pieza;
}
