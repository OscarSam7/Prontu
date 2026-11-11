'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Store,
  Plus,
  CheckCircle2,
  PauseCircle,
  Clock,
  Wallet,
  ExternalLink,
  Pencil,
  Trash2,
  Send,
  X,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { formatGuaranies } from '@/lib/kits';
import {
  Negocio,
  PlanSaaS,
  EstadoSuscripcion,
  PLANES_SAAS,
  slugifyNegocio,
} from '@/lib/saas';
import { useApp } from '@/lib/store';

interface NegocioFormState {
  nombre: string;
  slug: string;
  ciudad: string;
  duenoNombre: string;
  whatsapp: string;
  aliasSipap: string;
  colorPrimario: string;
  plan: PlanSaaS;
  estado: EstadoSuscripcion;
  pinAdmin: string;
}

const emptyNegocioForm: NegocioFormState = {
  nombre: '',
  slug: '',
  ciudad: 'Asunción - Paraguay',
  duenoNombre: '',
  whatsapp: '',
  aliasSipap: '',
  colorPrimario: '#FF4D7A',
  plan: 'pro',
  estado: 'prueba',
  pinAdmin: '2026',
};

export default function SuperAdminPage() {
  const {
    negocios,
    pagosSuscripcion,
    crearNegocio,
    actualizarNegocio,
    cambiarEstadoNegocio,
    registrarPagoSuscripcion,
    eliminarNegocio,
  } = useApp();

  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoSuscripcion>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const [form, setForm] = useState<NegocioFormState>(emptyNegocioForm);
  const [pagoModalNegocio, setPagoModalNegocio] = useState<Negocio | null>(null);
  const [metodoPago, setMetodoPago] = useState<
    'transferencia' | 'bancard' | 'pix' | 'efectivo'
  >('transferencia');

  // Métricas SaaS
  const activas = negocios.filter((n) => n.estado === 'activo');
  const enPrueba = negocios.filter((n) => n.estado === 'prueba');
  const suspendidas = negocios.filter((n) => n.estado === 'suspendido');
  const mrrEstimado = activas.reduce((acc, n) => acc + n.precioMensual, 0);
  const totalCobradoHistorial = pagosSuscripcion.reduce(
    (acc, p) => acc + p.monto,
    0
  );

  const filtrados =
    filtroEstado === 'todos'
      ? negocios
      : negocios.filter((n) => n.estado === filtroEstado);

  const openNuevoModal = () => {
    setEditingNegocio(null);
    setForm(emptyNegocioForm);
    setModalOpen(true);
  };

  const openEditarModal = (n: Negocio) => {
    setEditingNegocio(n);
    setForm({
      nombre: n.nombre,
      slug: n.slug,
      ciudad: n.ciudad,
      duenoNombre: n.duenoNombre,
      whatsapp: n.whatsapp,
      aliasSipap: n.aliasSipap,
      colorPrimario: n.colorPrimario,
      plan: n.plan,
      estado: n.estado,
      pinAdmin: n.pinAdmin,
    });
    setModalOpen(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim()) return;

    if (editingNegocio) {
      actualizarNegocio({
        ...editingNegocio,
        nombre: form.nombre.trim(),
        slug: slugifyNegocio(form.slug || form.nombre) || editingNegocio.slug,
        ciudad: form.ciudad.trim(),
        duenoNombre: form.duenoNombre.trim(),
        whatsapp: form.whatsapp.trim(),
        aliasSipap: form.aliasSipap.trim(),
        colorPrimario: form.colorPrimario,
        plan: form.plan,
        estado: form.estado,
        pinAdmin: form.pinAdmin.trim() || '2026',
      });
    } else {
      crearNegocio(form);
    }

    setModalOpen(false);
  };

  const handleConfirmarPago = () => {
    if (!pagoModalNegocio) return;
    registrarPagoSuscripcion(pagoModalNegocio.id, metodoPago);
    setPagoModalNegocio(null);
  };

  const handleRecordarWhatsApp = (n: Negocio) => {
    const cleanPhone = n.whatsapp.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('595')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `595${cleanPhone.slice(1)}`
      : `595${cleanPhone}`;

    const mensaje = [
      `Hola ${n.duenoNombre}! 👋`,
      `Te escribimos por tu sistema *${n.nombre}* (${PLANES_SAAS[n.plan].nombre}).`,
      `📅 Tu suscripción vence el *${n.fechaVencimiento}*.`,
      `💰 Abono mensual: *${formatGuaranies(n.precioMensual)}*`,
      `Podés renovar por transferencia al Alias *3233591* y enviarnos tu comprobante por acá. ¡Gracias!`,
    ].join('\n');

    window.open(
      `https://wa.me/${intlPhone}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    );
  };

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      {/* Header Super Admin */}
      <header className="bg-gradient-to-r from-gray-900 via-slate-800 to-brand-pinkDark rounded-3xl p-5 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-amber-300">
            <Crown className="w-3.5 h-3.5" /> Plataforma SaaS • Paraguay
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
            Super Admin • Control de Suscripciones
          </h1>
          <p className="text-xs text-gray-200 mt-0.5">
            Creá tiendas nuevas para tus clientes, cobrá mensualidades y activá o suspendé accesos.
          </p>
        </div>

        <button
          type="button"
          onClick={openNuevoModal}
          className="px-4 py-3 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shrink-0 transition"
        >
          <Plus className="w-4 h-4" />
          Crear Nueva Tienda
        </button>
      </header>

      {/* Cards de Métricas SaaS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-3xl p-4 shadow-card border border-emerald-100">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold text-gray-500">
              MRR (Ingreso Mensual)
            </span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-base sm:text-lg font-extrabold text-emerald-700">
            {formatGuaranies(mrrEstimado)}
          </p>
          <span className="text-[10px] text-gray-400">
            {activas.length} tienda(s) pagas activas
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-card border border-pink-100">
          <div className="flex items-center justify-between text-brand-pink mb-1">
            <span className="text-[11px] font-bold text-gray-500">
              Total Tiendas
            </span>
            <Store className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{negocios.length}</p>
          <span className="text-[10px] text-gray-400">
            {activas.length} activas • {suspendidas.length} pausadas
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-card border border-amber-100">
          <div className="flex items-center justify-between text-brand-gold mb-1">
            <span className="text-[11px] font-bold text-gray-500">
              En Prueba Gratis
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {enPrueba.length}
          </p>
          <span className="text-[10px] text-gray-400">Por convertir a pago</span>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-card border border-teal-100">
          <div className="flex items-center justify-between text-brand-teal mb-1">
            <span className="text-[11px] font-bold text-gray-500">
              Cobrado Registrado
            </span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-base sm:text-lg font-extrabold text-brand-teal">
            {formatGuaranies(totalCobradoHistorial)}
          </p>
          <span className="text-[10px] text-gray-400">
            {pagosSuscripcion.length} pago(s)
          </span>
        </div>
      </section>

      {/* Planes de Referencia */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.values(PLANES_SAAS).map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-pink">
                  {plan.nombre}
                </span>
                <span className="text-xs font-extrabold text-gray-900">
                  {formatGuaranies(plan.precioMensual)}/mes
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{plan.descripcion}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Lista de Tiendas Suscriptoras */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold text-gray-900 text-base">
            Negocios Suscriptores ({filtrados.length})
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'activo', label: 'Activos' },
                { id: 'prueba', label: 'Prueba' },
                { id: 'suspendido', label: 'Suspendidos' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroEstado(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filtroEstado === f.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-brand-bg text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtrados.map((n) => {
            const badgeStyle =
              n.estado === 'activo'
                ? 'bg-emerald-100 text-emerald-800'
                : n.estado === 'prueba'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-700';

            return (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: n.colorPrimario }}
                      />
                      <h3 className="font-extrabold text-gray-900 text-base">
                        {n.nombre}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badgeStyle}`}
                      >
                        {n.estado}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-pink-200 text-brand-pink">
                        {PLANES_SAAS[n.plan].nombre}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">
                      Dueño: <strong>{n.duenoNombre}</strong> • {n.ciudad} •
                      WhatsApp: <strong>{n.whatsapp}</strong>
                    </p>
                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                        Vence: <strong>{n.fechaVencimiento}</strong>
                      </span>
                      <span>
                        URL: <code className="text-brand-pink">/tienda/{n.slug}</code>
                      </span>
                      <span>PIN Admin: {n.pinAdmin}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Mensualidad</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {formatGuaranies(n.precioMensual)}
                    </span>
                  </div>
                </div>

                {/* Acciones por Suscriptor */}
                <div className="pt-2 border-t border-pink-200/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPagoModalNegocio(n)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm transition"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Registrar Pago (+30d)
                    </button>

                    {n.estado !== 'suspendido' ? (
                      <button
                        type="button"
                        onClick={() => cambiarEstadoNegocio(n.id, 'suspendido')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        Suspender
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cambiarEstadoNegocio(n.id, 'activo')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reactivar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRecordarWhatsApp(n)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 hover:bg-emerald-50 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Cobrar WA
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/tienda/${n.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-brand-pink text-xs font-bold flex items-center gap-1 hover:bg-pink-50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Tienda
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditarModal(n)}
                      className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-pink"
                      title="Editar negocio"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {n.id !== 'neg-pegue-y-monte-cde' && (
                      <button
                        type="button"
                        onClick={() => eliminarNegocio(n.id)}
                        className="p-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Eliminar negocio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Historial de Cobros de Suscripciones */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
        <h2 className="font-extrabold text-gray-900 text-base">
          Historial de Suscripciones Cobradas ({pagosSuscripcion.length})
        </h2>
        <div className="space-y-2">
          {pagosSuscripcion.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-brand-bg border border-pink-100 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-extrabold text-gray-900">
                  {p.negocioNombre}
                </span>
                <span className="block text-gray-500">
                  {p.id} • {PLANES_SAAS[p.plan].nombre} • {p.metodo.toUpperCase()} •{' '}
                  {p.fechaPago}
                </span>
              </div>
              <span className="font-extrabold text-emerald-700 text-sm">
                + {formatGuaranies(p.monto)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Crear / Editar Negocio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editingNegocio ? 'Editar Suscriptor' : 'Crear Nueva Tienda SaaS'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value,
                      slug: editingNegocio ? form.slug : slugifyNegocio(e.target.value),
                    })
                  }
                  placeholder="Ej: Deco Kids Asunción"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    URL Slug (/tienda/...)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugifyNegocio(e.target.value) })
                    }
                    placeholder="deco-kids-asu"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Dueño / Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.duenoNombre}
                    onChange={(e) =>
                      setForm({ ...form, duenoNombre: e.target.value })
                    }
                    placeholder="Nombre del cliente"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.value })
                    }
                    placeholder="0981 000 000"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Plan
                  </label>
                  <select
                    value={form.plan}
                    onChange={(e) =>
                      setForm({ ...form, plan: e.target.value as PlanSaaS })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    <option value="basico">Básico (150mil)</option>
                    <option value="pro">Pro (280mil)</option>
                    <option value="marca_blanca">Blanca (450mil)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estado: e.target.value as EstadoSuscripcion,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    <option value="prueba">Prueba 14d</option>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Color Marca
                  </label>
                  <input
                    type="color"
                    value={form.colorPrimario}
                    onChange={(e) =>
                      setForm({ ...form, colorPrimario: e.target.value })
                    }
                    className="w-full h-9 rounded-xl border border-pink-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Alias SIPAP de la tienda
                  </label>
                  <input
                    type="text"
                    value={form.aliasSipap}
                    onChange={(e) =>
                      setForm({ ...form, aliasSipap: e.target.value })
                    }
                    placeholder="Ej: 3233591"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    PIN de su Admin
                  </label>
                  <input
                    type="text"
                    value={form.pinAdmin}
                    onChange={(e) =>
                      setForm({ ...form, pinAdmin: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
              </div>

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
                  {editingNegocio ? 'Guardar Cambios' : 'Crear Tienda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago de Suscripción */}
      {pagoModalNegocio && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase">
                Renovar Suscripción (+30 días)
              </span>
              <h3 className="text-lg font-extrabold text-gray-900">
                {pagoModalNegocio.nombre}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Plan: <strong>{PLANES_SAAS[pagoModalNegocio.plan].nombre}</strong> •
                Monto: <strong>{formatGuaranies(pagoModalNegocio.precioMensual)}</strong>
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-gray-700">
                Método de cobro recibido:
              </label>
              <select
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(
                    e.target.value as
                      | 'transferencia'
                      | 'bancard'
                      | 'pix'
                      | 'efectivo'
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
              >
                <option value="transferencia">Transferencia / Alias SIPAP</option>
                <option value="bancard">Tarjeta Bancard / QR</option>
                <option value="pix">PIX</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPagoModalNegocio(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarPago}
                className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
