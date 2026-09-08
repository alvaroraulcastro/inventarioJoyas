"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ESTADOS_PIEZA,
  ESTADO_LABELS,
  MATERIALES_PIEZA,
  MATERIAL_LABELS,
  TIPOS_PIEZA,
  TIPO_LABELS,
  emptyPiezaInput,
  isPiezaActiva,
  type Pieza,
  type PiezaInput,
} from "@/lib/types";

type PieceFormProps = {
  piece?: Pieza | null;
  onClose: () => void;
  onSaved: () => void;
};

export function PieceForm({ piece, onClose, onSaved }: PieceFormProps) {
  const [form, setForm] = useState<PiezaInput>(emptyPiezaInput());
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (piece) {
      setForm({
        codigo: piece.codigo,
        nombre: piece.nombre,
        tipo: piece.tipo,
        material: piece.material,
        kilates: piece.kilates,
        peso_gramos: piece.peso_gramos,
        talla: piece.talla,
        piedras: piece.piedras,
        precio_costo: piece.precio_costo,
        precio_venta: piece.precio_venta,
        stock: piece.stock || "1",
        estado: piece.estado,
        ubicacion: piece.ubicacion,
        fecha_ingreso: piece.fecha_ingreso,
        notas: piece.notas,
        activo: isPiezaActiva(piece.activo) ? "si" : "no",
      });
    } else {
      setForm(emptyPiezaInput());
    }
    setFoto(null);
    setError("");
  }, [piece]);

  const [localPreview, setLocalPreview] = useState("");

  useEffect(() => {
    if (!foto) {
      setLocalPreview("");
      return;
    }
    const url = URL.createObjectURL(foto);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const preview = localPreview || (piece?.foto_id ? `/api/fotos/${piece.foto_id}` : "");

  function update<K extends keyof PiezaInput>(key: K, value: PiezaInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(piece ? `/api/piezas/${piece.id}` : "/api/piezas", {
        method: piece ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { pieza?: Pieza; error?: string };
      if (!response.ok || !data.pieza) {
        setError(data.error || "No se pudo guardar la pieza.");
        return;
      }

      if (foto) {
        const body = new FormData();
        body.append("foto", foto);
        const fotoResponse = await fetch(`/api/piezas/${data.pieza.id}/foto`, {
          method: "POST",
          body,
        });
        const fotoData = (await fotoResponse.json()) as { error?: string };
        if (!fotoResponse.ok) {
          setError(fotoData.error || "La pieza se guardó, pero la foto falló.");
          return;
        }
      }

      onSaved();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl rounded-3xl border border-line bg-ivory p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-gold-dark uppercase">Inventario</p>
            <h2 className="font-display text-3xl">
              {piece ? "Editar pieza" : "Nueva pieza"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:bg-cream"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                value={form.nombre}
                onChange={(event) => update("nombre", event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="codigo">Código</label>
              <input
                id="codigo"
                value={form.codigo}
                onChange={(event) => update("codigo", event.target.value)}
                placeholder="SKU o código interno"
              />
            </div>
            <div className="field">
              <label htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(event) => update("tipo", event.target.value)}
              >
                {TIPOS_PIEZA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="material">Material</label>
              <select
                id="material"
                value={form.material}
                onChange={(event) => update("material", event.target.value)}
              >
                {MATERIALES_PIEZA.map((material) => (
                  <option key={material} value={material}>
                    {MATERIAL_LABELS[material]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="kilates">Kilates / ley</label>
              <input
                id="kilates"
                value={form.kilates}
                onChange={(event) => update("kilates", event.target.value)}
                placeholder="18k, 14k, 925"
              />
            </div>
            <div className="field">
              <label htmlFor="peso_gramos">Peso (gramos)</label>
              <input
                id="peso_gramos"
                value={form.peso_gramos}
                onChange={(event) => update("peso_gramos", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="talla">Talla</label>
              <input
                id="talla"
                value={form.talla}
                onChange={(event) => update("talla", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="piedras">Piedras</label>
              <input
                id="piedras"
                value={form.piedras}
                onChange={(event) => update("piedras", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="precio_costo">Precio de costo</label>
              <input
                id="precio_costo"
                inputMode="decimal"
                value={form.precio_costo}
                onChange={(event) => update("precio_costo", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="precio_venta">Precio de venta</label>
              <input
                id="precio_venta"
                inputMode="decimal"
                value={form.precio_venta}
                onChange={(event) => update("precio_venta", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                inputMode="numeric"
                min="0"
                value={form.stock}
                onChange={(event) => update("stock", event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={form.estado}
                onChange={(event) => update("estado", event.target.value)}
              >
                {ESTADOS_PIEZA.map((estado) => (
                  <option key={estado} value={estado}>
                    {ESTADO_LABELS[estado]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                id="ubicacion"
                value={form.ubicacion}
                onChange={(event) => update("ubicacion", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="fecha_ingreso">Fecha de ingreso</label>
              <input
                id="fecha_ingreso"
                type="date"
                value={form.fecha_ingreso}
                onChange={(event) => update("fecha_ingreso", event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="foto">Foto</label>
              <input
                id="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setFoto(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notas">Notas</label>
            <textarea
              id="notas"
              rows={3}
              value={form.notas}
              onChange={(event) => update("notas", event.target.value)}
            />
          </div>

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Vista previa de la pieza"
              className="h-40 w-40 rounded-2xl border border-line object-cover"
            />
          ) : null}

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar pieza"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
