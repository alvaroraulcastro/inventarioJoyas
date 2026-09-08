export const TIPOS_PIEZA = [
  "anillo",
  "collar",
  "pulsera",
  "aretes",
  "dije",
  "reloj",
  "otro",
] as const;

export const MATERIALES_PIEZA = [
  "acero",
  "laminado_oro",
  "oro",
  "plata",
  "platino",
  "otro",
] as const;

export const ESTADOS_PIEZA = [
  "disponible",
  "reservado",
  "vendido",
  "consignacion",
] as const;

export const ACTIVO_VALUES = ["si", "no"] as const;

export type TipoPieza = (typeof TIPOS_PIEZA)[number];
export type MaterialPieza = (typeof MATERIALES_PIEZA)[number];
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];
export type ActivoPieza = (typeof ACTIVO_VALUES)[number];

export const SHEET_HEADERS = [
  "id",
  "codigo",
  "nombre",
  "tipo",
  "material",
  "kilates",
  "peso_gramos",
  "talla",
  "piedras",
  "precio_costo",
  "precio_venta",
  "stock",
  "estado",
  "ubicacion",
  "fecha_ingreso",
  "foto_id",
  "notas",
  "activo",
  "actualizado_en",
] as const;

export const LEGACY_SHEET_HEADERS = [
  "id",
  "codigo",
  "nombre",
  "tipo",
  "material",
  "kilates",
  "peso_gramos",
  "talla",
  "piedras",
  "precio_costo",
  "precio_venta",
  "estado",
  "ubicacion",
  "fecha_ingreso",
  "foto_id",
  "notas",
  "actualizado_en",
] as const;

export type PiezaField = (typeof SHEET_HEADERS)[number];

export type SortField = "fecha_ingreso" | "stock" | "nombre" | "estado";
export type SortDirection = "asc" | "desc";

export interface Pieza {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  material: string;
  kilates: string;
  peso_gramos: string;
  talla: string;
  piedras: string;
  precio_costo: string;
  precio_venta: string;
  stock: string;
  estado: string;
  ubicacion: string;
  fecha_ingreso: string;
  foto_id: string;
  notas: string;
  activo: string;
  actualizado_en: string;
}

export type PiezaInput = Omit<Pieza, "id" | "foto_id" | "actualizado_en"> & {
  id?: string;
  foto_id?: string;
};

export const TIPO_LABELS: Record<string, string> = {
  anillo: "Anillo",
  collar: "Collar",
  pulsera: "Pulsera",
  aretes: "Aretes",
  dije: "Dije",
  reloj: "Reloj",
  otro: "Otro",
};

export const MATERIAL_LABELS: Record<string, string> = {
  acero: "Acero",
  laminado_oro: "Laminado en Oro",
  oro: "Oro",
  plata: "Plata",
  platino: "Platino",
  otro: "Otro",
};

export const ESTADO_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  consignacion: "Consignación",
};

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  fecha_ingreso: "Fecha de ingreso",
  stock: "Stock",
  nombre: "Nombre",
  estado: "Estado",
};

export function isPiezaActiva(activo: string) {
  const value = activo.trim().toLowerCase();
  return value === "" || value === "si" || value === "sí" || value === "true" || value === "1";
}

export function emptyPiezaInput(): PiezaInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    codigo: "",
    nombre: "",
    tipo: "anillo",
    material: "acero",
    kilates: "",
    peso_gramos: "",
    talla: "",
    piedras: "",
    precio_costo: "",
    precio_venta: "",
    stock: "1",
    estado: "disponible",
    ubicacion: "",
    fecha_ingreso: today,
    notas: "",
    activo: "si",
  };
}
