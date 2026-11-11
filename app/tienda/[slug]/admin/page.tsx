'use client';

import React, { useState, useEffect } from 'react';
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
  QrCode,
} from 'lucide-react';
import {
  Kit,
  formatGuaranies,
  PRECIOS_ROTURA,
  EstadoReserva,
  Reserva,
} from '@/lib/kits';
import { PLANES_SAAS } from '@/lib/saas';
import {
  uploadKitImage,
  uploadKitVideo,
  uploadMediaImage,
} from '@/lib/media';
import { useApp } from '@/lib/store';

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
    actualizarNegocio,
  } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
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

  // Marca & Cobros
  const [marcaNombre, setMarcaNombre] = useState('');
  const [marcaCiudad, setMarcaCiudad] = useState('');
  const [marcaWhatsapp, setMarcaWhatsapp] = useState('');
  const [marcaAlias, setMarcaAlias] = useState('');
  const [marcaColor, setMarcaColor] = useState('#FF4D7A');
  const [marcaLogo, setMarcaLogo] = useState<string | undefined>(undefined);
  const [marcaQr, setMarcaQr] = useState<string | undefined>(undefined);
  const [marcaGuardadaMsg, setMarcaGuardadaMsg] = useState<string | null>(null);
  const [subiendoMarca, setSubiendoMarca] = useState(false);

  useEffect(() => {
    if (!negocio) return;
    setMarcaNombre(negocio.nombre);
    setMarcaCiudad(negocio.ciudad);
    setMarcaWhatsapp(negocio.whatsapp);
    setMarcaAlias(negocio.aliasSipap);
    setMarcaColor(negocio.colorPrimario);
    setMarcaLogo(negocio.logoUrl);
    setMarcaQr(negocio.qrPagoUrl);
  }, [negocio]);

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
      if (pinInput.trim() === negocio.pinAdmin) {
        setAutenticado(true);
        setPinError('');
        setPinInput('');
      } else {
        setPinError('PIN incorrecto para esta tienda.');
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
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-brand-pink">
              Panel Administrativo Privado
            </span>
            <h1 className="text-xl font-extrabold text-gray-900">
              {negocio.nombre}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Ingresá el PIN de tu tienda para gestionar reservas, kits y tu marca.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 text-left">
            <input
              type="password"
              inputMode="numeric"
              required
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={`PIN de tu tienda (ej: ${negocio.pinAdmin})`}
              className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-center text-lg font-extrabold tracking-widest"
            />
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
          </form>
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

  const handleSubirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoMarca(true);
    try {
      const url = await uploadMediaImage(file, 'logos');
      setMarcaLogo(url);
    } finally {
      setSubiendoMarca(false);
    }
  };

  const handleSubirQrCobro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoMarca(true);
    try {
      const url = await uploadMediaImage(file, 'qr-pagos');
      setMarcaQr(url);
    } finally {
      setSubiendoMarca(false);
    }
  };

  const handleGuardarMarca = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarNegocio({
      ...negocio,
      nombre: marcaNombre.trim() || negocio.nombre,
      ciudad: marcaCiudad.trim() || negocio.ciudad,
      whatsapp: marcaWhatsapp.trim() || negocio.whatsapp,
      aliasSipap: marcaAlias.trim(),
      colorPrimario: marcaColor,
      logoUrl: marcaLogo,
      qrPagoUrl: marcaQr,
    });
    setMarcaGuardadaMsg('¡Datos de tu marca y QR guardados correctamente!');
    setTimeout(() => setMarcaGuardadaMsg(null), 4000);
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

      {tab === 'marca' && (
        <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
          <div>
            <h2 className="font-extrabold text-gray-900 text-base">
              Personalizá tu Tienda y QR de Cobros
            </h2>
            <p className="text-xs text-gray-500">
              Subí el logo de tu negocio y la imagen de tu QR de banco / PIX para que tus clientes transfieran la seña directo.
            </p>
          </div>

          <form onSubmit={handleGuardarMarca} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre de tu Tienda
                </label>
                <input
                  type="text"
                  value={marcaNombre}
                  onChange={(e) => setMarcaNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={marcaCiudad}
                  onChange={(e) => setMarcaCiudad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={marcaWhatsapp}
                  onChange={(e) => setMarcaWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Alias SIPAP
                </label>
                <input
                  type="text"
                  value={marcaAlias}
                  onChange={(e) => setMarcaAlias(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Color Principal
                </label>
                <input
                  type="color"
                  value={marcaColor}
                  onChange={(e) => setMarcaColor(e.target.value)}
                  className="w-full h-10 rounded-xl border border-pink-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Subida de Logo y QR de Cobro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-2 text-center">
                <span className="font-extrabold text-gray-800 block">
                  Logo de tu Negocio
                </span>
                {marcaLogo && (
                  <img
                    src={marcaLogo}
                    alt="Logo tienda"
                    className="w-20 h-20 rounded-2xl object-cover mx-auto border border-pink-200"
                  />
                )}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-brand-pink font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  {subiendoMarca ? 'Subiendo...' : 'Subir Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubirLogo}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-2 text-center">
                <span className="font-extrabold text-gray-800 flex items-center justify-center gap-1">
                  <QrCode className="w-4 h-4 text-brand-teal" />
                  Imagen QR de Transferencia / PIX
                </span>
                {marcaQr && (
                  <img
                    src={marcaQr}
                    alt="QR cobro"
                    className="w-24 h-24 rounded-xl object-contain mx-auto bg-white p-1 border border-pink-200"
                  />
                )}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-teal-200 text-brand-teal font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  {subiendoMarca ? 'Subiendo...' : 'Subir Foto de QR'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubirQrCobro}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {marcaGuardadaMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-center">
                {marcaGuardadaMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={subiendoMarca}
              className="w-full py-3.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold shadow"
            >
              Guardar Marca y Cobros
            </button>
          </form>
        </section>
      )}

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
