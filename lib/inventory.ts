import type { Pieza, SortDirection, SortField } from "@/lib/types";
import { ESTADOS_PIEZA, isPiezaActiva } from "@/lib/types";

export function comparePiezas(a: Pieza, b: Pieza, field: SortField, direction: SortDirection) {
  let result = 0;

  switch (field) {
    case "nombre":
      result = a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
      break;
    case "fecha_ingreso":
      result = a.fecha_ingreso.localeCompare(b.fecha_ingreso);
      break;
    case "stock":
      result = parseNumber(a.stock) - parseNumber(b.stock);
      break;
    case "estado":
      result =
        ESTADOS_PIEZA.indexOf(a.estado as (typeof ESTADOS_PIEZA)[number]) -
        ESTADOS_PIEZA.indexOf(b.estado as (typeof ESTADOS_PIEZA)[number]);
      if (result === 0) {
        result = a.estado.localeCompare(b.estado, "es", { sensitivity: "base" });
      }
      break;
  }

  return direction === "asc" ? result : -result;
}

function parseNumber(value: string) {
  const amount = Number(String(value).replace(",", "."));
  return Number.isNaN(amount) ? 0 : amount;
}

export type ActivoFilter = "activos" | "inactivos" | "todos";

export function matchesActivoFilter(pieza: Pieza, filter: ActivoFilter) {
  const activa = isPiezaActiva(pieza.activo);
  if (filter === "activos") return activa;
  if (filter === "inactivos") return !activa;
  return true;
}
