"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PieceForm } from "@/components/PieceForm";
import { comparePiezas, matchesActivoFilter, type ActivoFilter } from "@/lib/inventory";
import { estadoClass, estadoLabel, formatMoney, materialLabel, tipoLabel } from "@/lib/format";
import {
  ESTADOS_PIEZA,
  ESTADO_LABELS,
  SORT_FIELD_LABELS,
  TIPOS_PIEZA,
  TIPO_LABELS,
  isPiezaActiva,
  type Pieza,
  type SortDirection,
  type SortField,
} from "@/lib/types";

export function InventoryList() {
  const router = useRouter();
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [activoFilter, setActivoFilter] = useState<ActivoFilter>("activos");
  const [sortField, setSortField] = useState<SortField>("fecha_ingreso");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editing, setEditing] = useState<Pieza | null>(null);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/piezas");
      const data = (await response.json()) as { piezas?: Pieza[]; error?: string };
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        setError(data.error || "No se pudo cargar el inventario.");
        setPiezas([]);
        return;
      }
      setPiezas(data.piezas ?? []);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = piezas.filter((pieza) => {
      const matchesTerm =
        !term ||
        [pieza.nombre, pieza.codigo, pieza.piedras, pieza.ubicacion, pieza.notas, pieza.material]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesTipo = !tipo || pieza.tipo === tipo;
      const matchesEstado = !estado || pieza.estado === estado;
      const matchesActivo = matchesActivoFilter(pieza, activoFilter);
      return matchesTerm && matchesTipo && matchesEstado && matchesActivo;
    });

    return [...items].sort((a, b) => comparePiezas(a, b, sortField, sortDirection));
  }, [piezas, query, tipo, estado, activoFilter, sortField, sortDirection]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  async function toggleActivo(pieza: Pieza) {
    const activa = isPiezaActiva(pieza.activo);
    const next = activa ? "no" : "si";
    const message = activa
      ? `¿Desactivar "${pieza.nombre}"? Seguirá en la hoja para métricas futuras.`
      : `¿Reactivar "${pieza.nombre}"?`;

    if (!window.confirm(message)) return;

    setTogglingId(pieza.id);
    try {
      const response = await fetch(`/api/piezas/${pieza.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: next }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "No se pudo actualizar la pieza.");
        return;
      }
      await load();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold-dark uppercase">Colección</p>
          <h1 className="font-display text-4xl text-ink md:text-5xl">Inventario de joyas</h1>
          <p className="mt-2 text-muted">Administra piezas, precios, estado y fotografías.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Erika</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-ivory"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mb-4 grid gap-3 lg:grid-cols-[1fr_repeat(3,minmax(0,160px))_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, código, piedras..."
          className="rounded-2xl border border-line bg-ivory px-4 py-3"
        />
        <select
          value={tipo}
          onChange={(event) => setTipo(event.target.value)}
          className="rounded-2xl border border-line bg-ivory px-3 py-3"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_PIEZA.map((value) => (
            <option key={value} value={value}>
              {TIPO_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(event) => setEstado(event.target.value)}
          className="rounded-2xl border border-line bg-ivory px-3 py-3"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PIEZA.map((value) => (
            <option key={value} value={value}>
              {ESTADO_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={activoFilter}
          onChange={(event) => setActivoFilter(event.target.value as ActivoFilter)}
          className="rounded-2xl border border-line bg-ivory px-3 py-3"
        >
          <option value="activos">Solo activas</option>
          <option value="inactivos">Solo inactivas</option>
          <option value="todos">Activas e inactivas</option>
        </select>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white hover:bg-gold-dark"
        >
          Nueva pieza
        </button>
      </section>

      <section className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Ordenar por
          <select
            value={sortField}
            onChange={(event) => setSortField(event.target.value as SortField)}
            className="rounded-xl border border-line bg-ivory px-3 py-2 text-ink"
          >
            {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
              <option key={field} value={field}>
                {SORT_FIELD_LABELS[field]}
              </option>
            ))}
          </select>
        </label>
        <select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as SortDirection)}
          className="rounded-xl border border-line bg-ivory px-3 py-2 text-sm text-ink"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <span className="text-sm text-muted">{filtered.length} pieza(s)</span>
      </section>

      {error ? (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-muted">Cargando inventario...</p>
      ) : error ? null : piezas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-ivory px-6 py-16 text-center">
          <h2 className="font-display text-2xl">Aún no hay piezas</h2>
          <p className="mt-2 text-muted">Agrega la primera joya para comenzar el inventario.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-ivory px-6 py-16 text-center">
          <h2 className="font-display text-2xl">Sin resultados</h2>
          <p className="mt-2 text-muted">Prueba con otro término o quita los filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pieza) => {
            const activa = isPiezaActiva(pieza.activo);
            return (
              <article
                key={pieza.id}
                className={`overflow-hidden rounded-3xl border border-line bg-ivory shadow-sm ${activa ? "" : "opacity-70"}`}
              >
                <div className="aspect-[4/3] bg-cream">
                  {pieza.foto_id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/fotos/${pieza.foto_id}`}
                      alt={pieza.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      Sin foto
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-[0.16em] text-gold-dark uppercase">
                        {pieza.codigo || "Sin código"}
                      </p>
                      <h3 className="font-display text-2xl">{pieza.nombre}</h3>
                      <p className="text-sm text-muted">
                        {tipoLabel(pieza.tipo)} · {materialLabel(pieza.material)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${estadoClass(pieza.estado)}`}
                      >
                        {estadoLabel(pieza.estado)}
                      </span>
                      {!activa ? (
                        <span className="rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          Inactiva
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-lg font-medium">{formatMoney(pieza.precio_venta)}</p>
                    <p className="text-muted">Stock: {pieza.stock || "1"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(pieza)}
                      className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-cream"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleActivo(pieza)}
                      disabled={togglingId === pieza.id}
                      className="rounded-full border border-amber-200 px-3 py-1.5 text-sm text-amber-900 hover:bg-amber-50 disabled:opacity-60"
                    >
                      {togglingId === pieza.id
                        ? "Guardando..."
                        : activa
                          ? "Desactivar"
                          : "Reactivar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {creating || editing ? (
        <PieceForm
          piece={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
