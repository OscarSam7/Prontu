'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Lock,
  LogOut,
  CalendarCheck,
  PackageCheck,
  RotateCcw,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  XCircle,
  ExternalLink,
  Upload,
  Pencil,
  FileImage,
  X,
  Palette,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
} from 'lucide-react';
import {
  Kit,
  formatGuaranies,
  PRECIOS_ROTURA,
  EstadoReserva,
  Reserva,
} from '@/lib/kits';
import { PLANES_SAAS } from '@/lib/saas';
import { uploadKitImage, uploadKitVideo } from '@/lib/media';
import { useApp } from '@/lib/store';
import StoreBrandingEditor from '@/components/StoreBrandingEditor';

const FOTO_DEFAULT =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80';

export default function TiendaAdminPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const {
    negocios,
    getKitsByNegocio,
    getReservasByNegocio,
    actualizarEstadoReserva,
    registrarDevolucion,
    agregarKit,
    editarKit,
    toggleDisponibilidadKit,
    eliminarKit,
    recuperarPinNegocio,
  } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  const [autenticado, setAutenticado] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recEmail, setRecEmail] = useState('');
  const [recWhatsapp, setRecWhatsapp] = useState('');
  const [recNuevoPin, setRecNuevoPin] = useState('');
  const [recSuccess, setRecSuccess] = useState('');
  const [tab, setTab] = useState<'reservas' | 'kits' | 'marca'>('reservas');

  // Modales reservas
  const [modalRotoReserva, setModalRotoReserva] = useState<Reserva | null>(null);
  const [itemsSeleccionados, setItemsSeleccionados] = useState<string[]>([]);
  const [comprobantePreview, setComprobantePreview] = useState<Reserva | null>(
    null
  );

  // Modal agregar / modificar kit
  const [modalKitOpen, setModalKitOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [nombreKit, setNombreKit] = useState('');
  const [categoriaKit, setCategoriaKit] = useState('Cumple');
  const [precioPubKit, setPrecioPubKit] = useState('650000');
  const [precioDecoKit, setPrecioDecoKit] = useState('450000');
  const [descKit, setDescKit] = useState('');
  const [fotosKit, setFotosKit] = useState<string[]>([FOTO_DEFAULT]);
  const [videoKit, setVideoKit] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [kitError, setKitError] = useState<string | null>(null);

  if (!negocio) {
    return (
      <main className="px-4 pt-12 max-w-md mx-auto text-center">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-pink-100 space-y-3">
          <h1 className="text-lg font-extrabold">Tienda no encontrada</h1>
          <Link href="/" className="text-xs font-bold text-brand-pink underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (!autenticado) {
    const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const emailOk =
        emailInput.trim().toLowerCase() ===
        (negocio.emailAdmin || '').trim().toLowerCase();
      if (!emailOk) {
        setPinError('El Gmail ingresado no coincide con el de esta tienda.');
        return;
      }
      if (pinInput.trim() === negocio.pinAdmin) {
        setAutenticado(true);
        setPinError('');
        setPinInput('');
      } else {
        setPinError('Contraseña / PIN incorrecto para esta tienda.');
      }
    };

    const handleRecuperar = (e: React.FormEvent) => {
      e.preventDefault();
      setPinError('');
      setRecSuccess('');
      const res = recuperarPinNegocio(
        negocio.id,
        recEmail,
        recWhatsapp,
        recNuevoPin
      );
      if (!res.ok) {
        setPinError(res.error || 'Datos incorrectos.');
      } else {
        setRecSuccess(
          '¡Contraseña restablecida! Ya podés iniciar sesión con tu nueva clave.'
        );
        setEmailInput(recEmail);
        setPinInput('');
        setTimeout(() => {
          setModoRecuperar(false);
        }, 1800);
      }
    };

    return (
      <main className="px-4 pt-10 pb-12 max-w-md mx-auto space-y-4">
        <Link
          href={`/tienda/${slug}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-xs font-bold text-gray-700"
        >
          ← Volver a {negocio.nombre}
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-pink-100 space-y-4 text-center">
          <div
            className="w-14 h-14 rounded-2xl text-white flex items-center justify-center mx-auto"
            style={{ backgroundColor: negocio.colorPrimario }}
          >
            {modoRecuperar ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-brand-pink">
              Panel Administrativo Privado
            </span>
            <h1 className="text-xl font-extrabold text-gray-900">
              {modoRecuperar ? 'Recuperar Contraseña' : negocio.nombre}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {modoRecuperar
                ? 'Validá tu Gmail y WhatsApp registrado para cambiar tu clave.'
                : 'Ingresá con tu Gmail (ID) y tu Contraseña / PIN para gestionar tu tienda.'}
            </p>
          </div>

          {!modoRecuperar ? (
            <form onSubmit={handlePinSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Gmail / Correo (ID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contraseña / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Ingresá tu contraseña / PIN"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-center text-base font-extrabold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-600 text-center">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-brand-pink text-white font-extrabold text-sm shadow-md"
              >
                Entrar a mi Panel
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPinError('');
                    setRecSuccess('');
                    setRecEmail(emailInput);
                    setModoRecuperar(true);
                  }}
                  className="text-xs font-bold text-brand-pink hover:underline"
                >
                  ¿Olvidaste tu contraseña? Recuperar acceso
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Gmail registrado (ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp registrado en la tienda *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={recWhatsapp}
                    onChange={(e) => setRecWhatsapp(e.target.value)}
                    placeholder="Ej: 0981 555 210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nueva Contraseña / PIN *
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={recNuevoPin}
                  onChange={(e) => setRecNuevoPin(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-bold text-center"
                />
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-600 text-center">
                  {pinError}
                </p>
              )}
              {recSuccess && (
                <p className="text-xs font-bold text-emerald-700 text-center">
                  {recSuccess}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPinError('');
                    setModoRecuperar(false);
                  }}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-brand-teal text-white font-extrabold text-xs shadow"
                >
                  Restablecer Clave
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  const misReservas = getReservasByNegocio(negocio.id);
  const misKits = getKitsByNegocio(negocio.id);
  const hoyStr = new Date().toISOString().split('T')[0];

  const reservasHoy = misReservas.filter(
    (r) => r.creadoEn === hoyStr || r.fechaRetiro === hoyStr
  ).length;
  const retiros = misReservas.filter(
    (r) => r.fechaRetiro === hoyStr || r.estado === 'Pagó 50%'
  ).length;
  const devoluciones = misReservas.filter((r) => r.estado === 'Retirado').length;
  const cobrado = misReservas.reduce((acc, r) => {
    if (r.estado === 'Pendiente') return acc;
    if (r.estado === 'Pagó 50%') return acc + r.sena50;
    return acc + r.precioTotal;
  }, 0);
  const pendiente = misReservas.reduce((acc, r) => {
    if (r.estado === 'Pendiente') return acc + r.precioTotal;
    if (r.estado === 'Pagó 50%') return acc + r.saldoPendiente;
    return acc;
  }, 0);

  const openNuevoKit = () => {
    setEditingKit(null);
    setNombreKit('');
    setCategoriaKit('Cumple');
    setPrecioPubKit('650000');
    setPrecioDecoKit('450000');
    setDescKit('');
    setFotosKit([FOTO_DEFAULT]);
    setVideoKit('');
    setKitError(null);
    setModalKitOpen(true);
  };

  const openEditarKit = (k: Kit) => {
    setEditingKit(k);
    setNombreKit(k.nombre);
    setCategoriaKit(k.categoria);
    setPrecioPubKit(String(k.precioPublico));
    setPrecioDecoKit(String(k.precioDecoradora));
    setDescKit(k.descripcion);
    setFotosKit(k.fotos.length > 0 ? k.fotos : [FOTO_DEFAULT]);
    setVideoKit(
      k.videoUrl && !k.videoUrl.includes('dQw4w9WgXcQ') ? k.videoUrl : ''
    );
    setKitError(null);
    setModalKitOpen(true);
  };

  const handleSubirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSubiendo(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadKitImage(f)));
      setFotosKit((prev) => [
        ...prev.filter((u) => u !== FOTO_DEFAULT),
        ...urls,
      ]);
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubirVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const res = await uploadKitVideo(file);
    if (res.error) setKitError(res.error);
    else if (res.url) setVideoKit(res.url);
    setSubiendo(false);
  };

  const handleGuardarKit = (e: React.FormEvent) => {
    e.preventDefault();
    setKitError(null);
    if (!nombreKit.trim()) return;

    const grupo =
      categoriaKit === 'Sonido' ||
      categoriaKit === 'Luces' ||
      categoriaKit === 'Pantallas'
        ? 'Audiovisual'
        : 'Deco';

    if (editingKit) {
      editarKit({
        ...editingKit,
        negocioId: negocio.id,
        nombre: nombreKit.trim(),
        categoria: categoriaKit,
        grupo,
        precioPublico: Number(precioPubKit) || editingKit.precioPublico,
        precioDecoradora: Number(precioDecoKit) || editingKit.precioDecoradora,
        descripcion: descKit.trim() || editingKit.descripcion,
        fotos: fotosKit,
        videoUrl: videoKit.trim() || editingKit.videoUrl,
      });
    } else {
      const limite = PLANES_SAAS[negocio.plan].limiteKits;
      if (limite && misKits.length >= limite) {
        setKitError(
          `Tu ${PLANES_SAAS[negocio.plan].nombre} permite hasta ${limite} kits. Contactá al Super Admin para pasar al Plan Pro ilimitado.`
        );
        return;
      }

      agregarKit({
        negocioId: negocio.id,
        nombre: nombreKit.trim(),
        categoria: categoriaKit,
        grupo,
        precioPublico: Number(precioPubKit) || 650000,
        precioDecoradora: Number(precioDecoKit) || 450000,
        garantia: grupo === 'Audiovisual' ? 500000 : 300000,
        descripcion:
          descKit.trim() ||
          'Kit listo para montar en 15 minutos sin herramientas.',
        incluye: [
          'Panel circular + 3 cilindros con fundas',
          'Arco desmontable y adornos temáticos',
        ],
        noIncluye: ['Globos ni dulces'],
        fotos: fotosKit,
        videoUrl: videoKit.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        disponible: true,
      });
    }

    setModalKitOpen(false);
  };

  const toggleItemRoto = (id: string) => {
    setItemsSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalDescuentoRoto = itemsSeleccionados.reduce((acc, id) => {
    const item = PRECIOS_ROTURA.find((p) => p.id === id);
    return acc + (item ? item.precio : 0);
  }, 0);

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      {/* Barra superior Admin Tienda */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-3xl p-4 shadow-card border border-pink-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-brand-pink">
            Admin de {negocio.nombre} ({PLANES_SAAS[negocio.plan].nombre})
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Gestión de Tu Negocio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/tienda/${slug}`}
            className="px-3 py-1.5 rounded-xl bg-pink-50 text-brand-pink text-xs font-extrabold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Tienda
          </Link>
          <button
            type="button"
            onClick={() => setAutenticado(false)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      {/* 5 Cards Dashboard de la Tienda */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-pink-100">
          <div className="flex items-center justify-between text-brand-pink mb-1">
            <span className="text-[11px] font-bold text-gray-500">Reservas hoy</span>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{reservasHoy}</p>
        </div>
        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-amber-100">
          <div className="flex items-center justify-between text-brand-gold mb-1">
            <span className="text-[11px] font-bold text-gray-500">Retiros</span>
            <PackageCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{retiros}</p>
        </div>
        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-teal-100">
          <div className="flex items-center justify-between text-brand-teal mb-1">
            <span className="text-[11px] font-bold text-gray-500">Devoluciones</span>
            <RotateCcw className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{devoluciones}</p>
        </div>
        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-emerald-100">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold text-gray-500">Cobrado</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-sm font-extrabold text-emerald-700">
            {formatGuaranies(cobrado)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-3.5 shadow-card border border-rose-100">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-bold text-gray-500">Pendiente</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-sm font-extrabold text-rose-600">
            {formatGuaranies(pendiente)}
          </p>
        </div>
      </section>

      {/* Tabs Reservas / Mis Kits / Mi Marca & Cobros */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('reservas')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition ${
            tab === 'reservas'
              ? 'bg-brand-pink text-white shadow'
              : 'bg-white text-gray-600 border border-pink-100'
          }`}
        >
          Reservas ({misReservas.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('kits')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition ${
            tab === 'kits'
              ? 'bg-brand-pink text-white shadow'
              : 'bg-white text-gray-600 border border-pink-100'
          }`}
        >
          Mis Kits ({misKits.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('marca')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-1.5 ${
            tab === 'marca'
              ? 'bg-brand-pink text-white shadow'
              : 'bg-white text-gray-600 border border-pink-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Mi Marca y QR
        </button>
      </div>

      {tab === 'reservas' && (
        <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
          <h2 className="font-extrabold text-gray-900 text-base">
            Reservas de {negocio.nombre}
          </h2>
          {misReservas.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              Todavía no recibiste reservas en esta tienda. Compartí el link{' '}
              <code>/tienda/{slug}</code> con tus clientes para empezar.
            </p>
          ) : (
            <div className="space-y-3">
              {misReservas.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-2.5"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-brand-pink">
                        {r.id} • {r.estado}
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-sm">
                        {r.kitNombre}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {r.clienteNombre} • {r.clienteWhatsapp} • {r.fechaRetiro} →{' '}
                        {r.fechaDevolucion}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-extrabold text-gray-900">
                        {formatGuaranies(r.precioTotal)}
                      </p>
                      <p className="text-emerald-700 font-bold">
                        Seña: {formatGuaranies(r.sena50)}
                      </p>
                      {r.comprobanteUrl && (
                        <button
                          type="button"
                          onClick={() => setComprobantePreview(r)}
                          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                          Ver Comprobante
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pink-200/40">
                    <div className="flex flex-wrap gap-1">
                      {(
                        ['Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto'] as EstadoReserva[]
                      ).map((est) => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => actualizarEstadoReserva(r.id, est)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                            r.estado === est
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          {est}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => registrarDevolucion(r.id, 'OK', [])}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalRotoReserva(r);
                          setItemsSeleccionados(r.itemsRotos || []);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Roto
                      </button>
                      <button
                        type="button"
                        onClick={() => registrarDevolucion(r.id, 'Sucio', [])}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Sucio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'kits' && (
        <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900 text-base">
              Inventario de {negocio.nombre}
            </h2>
            <button
              type="button"
              onClick={openNuevoKit}
              className="px-3.5 py-2 rounded-2xl bg-brand-pink text-white text-xs font-extrabold flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Agregar Kit
            </button>
          </div>

          <div className="space-y-2.5">
            {misKits.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-2xl bg-brand-bg border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={k.fotos[0]}
                    alt={k.nombre}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-gray-900 text-sm truncate">
                      {k.nombre}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatGuaranies(k.precioPublico)} • Decoradora:{' '}
                      {formatGuaranies(k.precioDecoradora)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleDisponibilidadKit(k.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                      k.disponible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {k.disponible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Pausado
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditarKit(k)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-pink-200 text-gray-700 text-xs font-extrabold flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modificar
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarKit(k.id)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200"
                    title="Borrar kit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'marca' && <StoreBrandingEditor negocio={negocio} />}

      {/* Modal Agregar / Modificar Kit Propio */}
      {modalKitOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3 my-6">
            <h3 className="text-lg font-extrabold text-gray-900">
              {editingKit
                ? `Modificar Kit: ${editingKit.nombre}`
                : `Nuevo Kit en ${negocio.nombre}`}
            </h3>
            <form onSubmit={handleGuardarKit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={nombreKit}
                onChange={(e) => setNombreKit(e.target.value)}
                placeholder="Nombre del Kit (ej: Frozen Cristal)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={categoriaKit}
                  onChange={(e) => setCategoriaKit(e.target.value)}
                  className="px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                >
                  {['Cumple', '15 Años', 'Boda', 'Bautismo', 'Sonido', 'Luces'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
                <input
                  type="number"
                  value={precioPubKit}
                  onChange={(e) => setPrecioPubKit(e.target.value)}
                  placeholder="Público Gs."
                  className="px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                />
                <input
                  type="number"
                  value={precioDecoKit}
                  onChange={(e) => setPrecioDecoKit(e.target.value)}
                  placeholder="Deco Gs."
                  className="px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                />
              </div>
              <textarea
                rows={2}
                value={descKit}
                onChange={(e) => setDescKit(e.target.value)}
                placeholder="Descripción del kit..."
                className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
              <input
                type="text"
                value={videoKit}
                onChange={(e) => setVideoKit(e.target.value)}
                placeholder="Link de YouTube / video tutorial (opcional)"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
              <div className="flex flex-wrap gap-2">
                <label className="px-3 py-2 rounded-xl bg-pink-50 text-brand-pink font-bold cursor-pointer inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  {subiendo ? 'Subiendo...' : `Subir Fotos (${fotosKit.length})`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSubirFotos}
                    className="hidden"
                  />
                </label>
                <label className="px-3 py-2 rounded-xl bg-teal-50 text-brand-teal font-bold cursor-pointer inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  Subir Video Tutorial
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleSubirVideo}
                    className="hidden"
                  />
                </label>
              </div>
              {kitError && <p className="text-rose-600 font-bold">{kitError}</p>}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalKitOpen(false)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendo}
                  className="py-3 rounded-2xl bg-brand-pink text-white font-extrabold"
                >
                  {editingKit ? 'Guardar Cambios' : 'Guardar Kit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vista Previa Comprobante */}
      {comprobantePreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Comprobante • {comprobantePreview.id}
                </h3>
                <p className="text-xs text-gray-500">
                  {comprobantePreview.clienteNombre} • Seña:{' '}
                  {formatGuaranies(comprobantePreview.sena50)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComprobantePreview(null)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {comprobantePreview.comprobanteUrl?.startsWith('data:application/pdf') ||
            comprobantePreview.comprobanteUrl?.endsWith('.pdf') ? (
              <div className="p-5 bg-brand-bg rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-gray-700">
                  Comprobante en PDF: {comprobantePreview.comprobanteNombre}
                </p>
                <a
                  href={comprobantePreview.comprobanteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-pink text-white text-xs font-extrabold"
                >
                  Abrir PDF
                </a>
              </div>
            ) : (
              <img
                src={comprobantePreview.comprobanteUrl}
                alt="Comprobante"
                className="w-full max-h-96 object-contain rounded-2xl bg-gray-100 border border-gray-200"
              />
            )}

            <button
              type="button"
              onClick={() => setComprobantePreview(null)}
              className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Reporte Roto */}
      {modalRotoReserva && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900">
              Descuento de Garantía por Rotura
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {PRECIOS_ROTURA.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 cursor-pointer text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemsSeleccionados.includes(item.id)}
                      onChange={() => toggleItemRoto(item.id)}
                    />
                    {item.nombre}
                  </span>
                  <span className="text-rose-600">
                    - {formatGuaranies(item.precio)}
                  </span>
                </label>
              ))}
            </div>
            <div className="p-3 rounded-2xl bg-brand-bg text-xs flex justify-between font-extrabold">
              <span>Garantía a devolver:</span>
              <span className="text-brand-teal">
                {formatGuaranies(
                  Math.max(0, modalRotoReserva.garantia - totalDescuentoRoto)
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModalRotoReserva(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  registrarDevolucion(
                    modalRotoReserva.id,
                    'Roto',
                    itemsSeleccionados
                  );
                  setModalRotoReserva(null);
                }}
                className="py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs"
              >
                Aplicar Descuento
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
