import { ESTADO_LABELS, MATERIAL_LABELS, TIPO_LABELS } from "@/lib/types";

export function formatMoney(value: string) {
  if (!value) return "—";
  const amount = Number(String(value).replace(",", "."));
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLabel(map: Record<string, string>, value: string) {
  return map[value] ?? value ?? "—";
}

export function tipoLabel(value: string) {
  return formatLabel(TIPO_LABELS, value);
}

export function materialLabel(value: string) {
  return formatLabel(MATERIAL_LABELS, value);
}

export function estadoLabel(value: string) {
  return formatLabel(ESTADO_LABELS, value);
}

export function estadoClass(value: string) {
  switch (value) {
    case "disponible":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "reservado":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "vendido":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "consignacion":
      return "bg-sky-50 text-sky-800 border-sky-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}
