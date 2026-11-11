'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Kit, formatGuaranies } from '@/lib/kits';
import { useApp } from '@/lib/store';

const CATEGORIAS_OPCIONES = [
  'Cumple',
  '15 Años',
  'Boda',
  'Bautismo',
  'Empresa',
  'Sonido',
  'Luces',
  'Pantallas',
  'Combo Total',
];

const FOTO_DEFAULT =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80';

interface KitFormState {
  nombre: string;
  categoria: string;
  grupo: 'Deco' | 'Audiovisual';
  precioPublico: string;
  precioDecoradora: string;
  garantia: string;
  descripcion: string;
  incluyeTexto: string;
  noIncluyeTexto: string;
  fotosTexto: string;
  videoUrl: string;
  disponible: boolean;
}

const emptyFormState: KitFormState = {
  nombre: '',
  categoria: 'Cumple',
  grupo: 'Deco',
  precioPublico: '650000',
  precioDecoradora: '450000',
  garantia: '300000',
  descripcion: '',
  incluyeTexto:
    'Panel circular desmontable 1.80m\n3 Mesas cilíndricas con fundas\nArco de hierro para globos',
  noIncluyeTexto: 'Globos de látex\nDulces ni torta',
  fotosTexto: FOTO_DEFAULT,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  disponible: true,
};

const kitToFormState = (kit: Kit): KitFormState => ({
  nombre: kit.nombre,
  categoria: kit.categoria,
  grupo: kit.grupo,
  precioPublico: String(kit.precioPublico),
  precioDecoradora: String(kit.precioDecoradora),
  garantia: String(kit.garantia),
  descripcion: kit.descripcion,
  incluyeTexto: kit.incluye.join('\n'),
  noIncluyeTexto: kit.noIncluye.join('\n'),
  fotosTexto: kit.fotos.join('\n'),
  videoUrl: kit.videoUrl,
  disponible: kit.disponible,
});

export default function AdminKitsPage() {
  const {
    kits,
    toggleDisponibilidadKit,
    agregarKit,
    editarKit,
    eliminarKit,
  } = useApp();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Activos' | 'Desactivados'>('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [form, setForm] = useState<KitFormState>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [kitABorrar, setKitABorrar] = useState<Kit | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const kitsFiltrados = kits.filter((k) => {
    const coincideTexto =
      k.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      k.categoria.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideTexto) return false;
    if (filtroEstado === 'Activos') return k.disponible;
    if (filtroEstado === 'Desactivados') return !k.disponible;
    return true;
  });

  const openAgregarModal = () => {
    setEditingKit(null);
    setForm(emptyFormState);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditarModal = (kit: Kit) => {
    setEditingKit(kit);
    setForm(kitToFormState(kit));
    setFormError(null);
    setModalOpen(true);
  };

  const handleGuardarKit = (e: React.FormEvent) => {
    e.preventDefault();
    const precioPub = Number(form.precioPublico);
    const precioDeco = Number(form.precioDecoradora);
    const garantiaNum = Number(form.garantia);

    if (!form.nombre.trim() || !form.descripcion.trim()) {
      setFormError('Completá al menos el nombre y la descripción del kit.');
      return;
    }
    if (
      Number.isNaN(precioPub) ||
      precioPub <= 0 ||
      Number.isNaN(precioDeco) ||
      precioDeco <= 0 ||
      Number.isNaN(garantiaNum) ||
      garantiaNum < 0
    ) {
      setFormError('Ingresá montos válidos en Guaraníes.');
      return;
    }

    const parseLines = (text: string) =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    const fotosParsed = parseLines(form.fotosTexto);
    const fotos = fotosParsed.length > 0 ? fotosParsed : [FOTO_DEFAULT];
    const incluye = parseLines(form.incluyeTexto);
    const noIncluye = parseLines(form.noIncluyeTexto);

    if (editingKit) {
      editarKit({
        id: editingKit.id,
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        grupo: form.grupo,
        precioPublico: precioPub,
        precioDecoradora: precioDeco,
        garantia: garantiaNum,
        descripcion: form.descripcion.trim(),
        incluye,
        noIncluye,
        fotos,
        videoUrl: form.videoUrl.trim() || editingKit.videoUrl,
        rating: editingKit.rating,
        reseñas: editingKit.reseñas,
        disponible: form.disponible,
      });
    } else {
      agregarKit({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        grupo: form.grupo,
        precioPublico: precioPub,
        precioDecoradora: precioDeco,
        garantia: garantiaNum,
        descripcion: form.descripcion.trim(),
        incluye,
        noIncluye,
        fotos,
        videoUrl: form.videoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        disponible: form.disponible,
      });
    }

    setModalOpen(false);
  };

  const handleConfirmarBorrar = () => {
    if (!kitABorrar) return;
    const res = eliminarKit(kitABorrar.id);
    if (!res.ok) {
      setDeleteError(res.error || 'No se pudo eliminar el kit.');
      return;
    }
    setKitABorrar(null);
    setDeleteError(null);
  };

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Admin
        </Link>

        <button
          type="button"
          onClick={openAgregarModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white text-xs sm:text-sm font-extrabold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Agregar Kit
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
              Inventario de Kits ({kits.length})
            </h1>
            <p className="text-xs text-gray-500">
              Agregá kits nuevos, modificá precios/datos, desactivalos o borralos.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar kit..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-bg border border-pink-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>
        </div>

        {/* Filtros rápido Activos / Desactivados */}
        <div className="flex items-center gap-2">
          {(['Todos', 'Activos', 'Desactivados'] as const).map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filtroEstado === est
                  ? 'bg-gray-900 text-white'
                  : 'bg-brand-bg text-gray-600 hover:bg-pink-50'
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {kitsFiltrados.map((k) => (
            <div
              key={k.id}
              className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                k.disponible
                  ? 'bg-brand-bg border-pink-100'
                  : 'bg-gray-50 border-gray-200 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={k.fotos[0] || FOTO_DEFAULT}
                  alt={k.nombre}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-pink uppercase">
                      #{k.id} • {k.categoria}
                    </span>
                    {!k.disponible && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        DESACTIVADO
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm truncate">
                    {k.nombre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Público: <strong>{formatGuaranies(k.precioPublico)}</strong> •
                    Decoradora:{' '}
                    <strong className="text-amber-700">
                      {formatGuaranies(k.precioDecoradora)}
                    </strong>{' '}
                    • Garantía: {formatGuaranies(k.garantia)}
                  </p>
                </div>
              </div>

              {/* Botones de Acción: Activar/Desactivar, Modificar, Borrar */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleDisponibilidadKit(k.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                    k.disponible
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {k.disponible ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Desactivado
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openEditarModal(k)}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-pink-200 text-gray-700 hover:border-brand-pink hover:text-brand-pink flex items-center gap-1 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modificar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setKitABorrar(k);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Borrar
                </button>
              </div>
            </div>
          ))}

          {kitsFiltrados.length === 0 && (
            <div className="p-6 text-center text-xs text-gray-500">
              No se encontraron kits con ese filtro.
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar / Modificar Kit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editingKit ? `Modificar Kit #${editingKit.id}` : 'Agregar Nuevo Kit'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarKit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre del Kit *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Barbie Glam Rosa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  >
                    {CATEGORIAS_OPCIONES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tipo / Grupo
                  </label>
                  <select
                    value={form.grupo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        grupo: e.target.value as 'Deco' | 'Audiovisual',
                        garantia: e.target.value === 'Audiovisual' ? '500000' : '300000',
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  >
                    <option value="Deco">Deco</option>
                    <option value="Audiovisual">Audiovisual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Precio Público (Gs.)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.precioPublico}
                    onChange={(e) =>
                      setForm({ ...form, precioPublico: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Decoradora (Gs.)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.precioDecoradora}
                    onChange={(e) =>
                      setForm({ ...form, precioDecoradora: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Garantía (Gs.)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.garantia}
                    onChange={(e) => setForm({ ...form, garantia: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder="Descripción breve del kit..."
                  className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Qué incluye (1 ítem por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={form.incluyeTexto}
                    onChange={(e) =>
                      setForm({ ...form, incluyeTexto: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Qué NO incluye (1 ítem por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={form.noIncluyeTexto}
                    onChange={(e) =>
                      setForm({ ...form, noIncluyeTexto: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  URLs de Fotos (1 enlace por línea)
                </label>
                <textarea
                  rows={2}
                  value={form.fotosTexto}
                  onChange={(e) => setForm({ ...form, fotosTexto: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) =>
                    setForm({ ...form, disponible: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-teal"
                />
                <span className="font-bold text-gray-800">
                  Kit activo y visible para reservar
                </span>
              </label>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold shadow"
                >
                  {editingKit ? 'Guardar Cambios' : 'Crear Kit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Borrar Kit */}
      {kitABorrar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-rose-600 uppercase">
                Confirmar eliminación
              </span>
              <h3 className="text-lg font-extrabold text-gray-900">
                ¿Borrar &ldquo;{kitABorrar.nombre}&rdquo;?
              </h3>
              <p className="text-xs text-gray-500">
                Esta acción quita el kit del catálogo. Si solo querés pausarlo temporalmente, usá <strong>Desactivar</strong>.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-gold" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setKitABorrar(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarBorrar}
                className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow"
              >
                Sí, Borrar Kit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
