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
  "oro",
  "plata",
  "platino",
  "acero",
  "otro",
] as const;

export const ESTADOS_PIEZA = [
  "disponible",
  "reservado",
  "vendido",
  "consignacion",
] as const;

export type TipoPieza = (typeof TIPOS_PIEZA)[number];
export type MaterialPieza = (typeof MATERIALES_PIEZA)[number];
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];

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
  "estado",
  "ubicacion",
  "fecha_ingreso",
  "foto_id",
  "notas",
  "actualizado_en",
] as const;

export type PiezaField = (typeof SHEET_HEADERS)[number];

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
  estado: string;
  ubicacion: string;
  fecha_ingreso: string;
  foto_id: string;
  notas: string;
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
  oro: "Oro",
  plata: "Plata",
  platino: "Platino",
  acero: "Acero",
  otro: "Otro",
};

export const ESTADO_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  consignacion: "Consignación",
};

export function emptyPiezaInput(): PiezaInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    codigo: "",
    nombre: "",
    tipo: "anillo",
    material: "oro",
    kilates: "",
    peso_gramos: "",
    talla: "",
    piedras: "",
    precio_costo: "",
    precio_venta: "",
    estado: "disponible",
    ubicacion: "",
    fecha_ingreso: today,
    notas: "",
  };
}
