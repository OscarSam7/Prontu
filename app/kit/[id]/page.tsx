'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Play,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ShieldCheck,
  X,
  Crown,
} from 'lucide-react';
import {
  formatGuaranies,
  COSTO_UPSELL_SONIDO_CASA,
} from '@/lib/kits';
import { getPlayableVideoInfo } from '@/lib/media';
import { useApp } from '@/lib/store';
import Calendar from '@/components/Calendar';
import PaymentSummary from '@/components/PaymentSummary';

export default function KitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { kits, esDecoradora, toggleDecoradora, draft, updateDraft, rangoTieneConflicto } =
    useApp();

  const kitId = Number(params?.id || 1);
  const kit = kits.find((k) => k.id === kitId) || kits[0];

  const [fotoActiva, setFotoActiva] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [fechaRetiro, setFechaRetiro] = useState(draft.fechaRetiro);
  const [fechaDevolucion, setFechaDevolucion] = useState(draft.fechaDevolucion);
  const [agregaSonidoCasa, setAgregaSonidoCasa] = useState(draft.agregaSonidoCasa);
  const [alertaFecha, setAlertaFecha] = useState<string | null>(null);

  useEffect(() => {
    setFotoActiva(0);
  }, [kit.id]);

  const precioActual = esDecoradora ? kit.precioDecoradora : kit.precioPublico;
  const ahorro = kit.precioPublico - kit.precioDecoradora;

  const handleChangeFechas = (retiro: string, devolucion: string) => {
    setFechaRetiro(retiro);
    setFechaDevolucion(devolucion);
    setAlertaFecha(null);
  };

  const handleContinuarReserva = () => {
    if (!fechaRetiro || !fechaDevolucion) {
      setAlertaFecha('Por favor elegí la fecha de retiro y devolución en el calendario.');
      return;
    }
    if (rangoTieneConflicto(kit.id, fechaRetiro, fechaDevolucion)) {
      setAlertaFecha(
        'Este kit ya tiene una reserva activa en las fechas seleccionadas. Por favor elegí otra fecha disponible en verde.'
      );
      return;
    }

    updateDraft({
      kitId: kit.id,
      fechaRetiro,
      fechaDevolucion,
      agregaSonidoCasa,
    });

    router.push('/reserva');
  };

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700 hover:text-brand-pink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>

        <button
          type="button"
          onClick={toggleDecoradora}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-extrabold transition border ${
            esDecoradora
              ? 'bg-brand-gold text-white border-brand-gold shadow-sm'
              : 'bg-white text-gray-700 border-amber-200'
          }`}
        >
          <Crown className="w-4 h-4" />
          {esDecoradora ? 'Tarifa Decoradora ON' : '¿Sos Decoradora?'}
        </button>
      </div>

      {/* Galería de 5 fotos + Botón Play Video */}
      <section className="bg-white rounded-3xl p-3 sm:p-4 shadow-card border border-pink-100 space-y-3">
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-pink-50">
          <img
            src={kit.fotos[fotoActiva] || kit.fotos[0]}
            alt={`${kit.nombre} foto ${fotoActiva + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
          />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow">
              {kit.categoria}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-teal text-white shadow">
              Foto {fotoActiva + 1} de {kit.fotos.length}
            </span>
          </div>

          {/* Botón Play "Ver video de montaje" */}
          <button
            type="button"
            onClick={() => setMostrarVideo(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-bold text-xs sm:text-sm shadow-lg transition transform active:scale-95"
          >
            <span className="w-6 h-6 rounded-full bg-white text-brand-pink flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-brand-pink ml-0.5" />
            </span>
            Ver video de montaje
          </button>
        </div>

        {/* Miniaturas de las 5 fotos */}
        <div className="grid grid-cols-5 gap-2">
          {kit.fotos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFotoActiva(idx)}
              className={`relative h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                fotoActiva === idx
                  ? 'border-brand-pink scale-105 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={url}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Modal de Video de Montaje */}
      {mostrarVideo && (() => {
        const videoInfo = getPlayableVideoInfo(kit.videoUrl);
        const pasos =
          kit.pasosMontaje && kit.pasosMontaje.length > 0
            ? kit.pasosMontaje
            : [
                'Encastrá la estructura principal / panel circular siguiendo las marcas de color.',
                'Colocá las fundas elastizadas y acomodá las 3 mesas cilíndricas.',
                'Agregá los adornos, bandejas y conectá la luz LED o equipo de sonido. ¡Listo sin herramientas!',
              ];

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Tutorial de Montaje ({kit.tiempoArmado || '15 min aprox.'})
                  </h3>
                  <p className="text-xs text-gray-500">Kit: {kit.nombre}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarVideo(false)}
                  className="p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto">
                <div className="p-4 bg-gray-900 text-white">
                  {videoInfo.type === 'video' ? (
                    <video
                      src={videoInfo.src}
                      controls
                      playsInline
                      className="aspect-video w-full rounded-2xl bg-black"
                    />
                  ) : videoInfo.type === 'iframe' ? (
                    <iframe
                      src={videoInfo.src}
                      title={`Tutorial ${kit.nombre}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full rounded-2xl border-0 bg-black"
                    />
                  ) : (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center relative border border-white/10">
                      <img
                        src={kit.fotos[0]}
                        alt={kit.nombre}
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                      <div className="relative z-10 text-center p-5 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-brand-pink text-white flex items-center justify-center mx-auto shadow-lg">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                        <p className="font-extrabold text-sm">
                          Guía Visual Pegue y Monte: {kit.nombre}
                        </p>
                        <p className="text-[11px] text-gray-200 max-w-xs mx-auto">
                          Podés seguir los pasos aquí abajo o subir el video propio desde Admin → Inventario de Kits.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pasos de armado y detalles */}
                <div className="p-4 space-y-2.5 bg-white text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-900">
                      Paso a paso para armar:
                    </span>
                    {kit.medidasTransporte && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal font-bold text-[11px]">
                        {kit.medidasTransporte}
                      </span>
                    )}
                  </div>
                  <ol className="space-y-1.5 list-decimal list-inside text-gray-700">
                    {pasos.map((paso, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {paso}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="p-3 bg-brand-bg text-center border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setMostrarVideo(false)}
                  className="w-full py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs"
                >
                  Entendido, volver al kit
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Encabezado e Info Principal del Kit */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{kit.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">
                ({kit.reseñas} reseñas verificadas en CDE)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{kit.nombre}</h1>
          </div>

          <div className="text-right">
            {esDecoradora && (
              <span className="text-xs text-gray-400 line-through block">
                {formatGuaranies(kit.precioPublico)}
              </span>
            )}
            <span className="text-xl sm:text-2xl font-extrabold text-brand-pink">
              {formatGuaranies(precioActual)}
            </span>
            <span className="block text-[11px] text-gray-500">
              Seña hoy: {formatGuaranies(Math.round(precioActual * 0.5))}
            </span>
          </div>
        </div>

        {esDecoradora && (
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
            <span>
              Ahorrás {formatGuaranies(ahorro)} con membresía Decoradora en este kit
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 leading-relaxed">{kit.descripcion}</p>

        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            Garantía reembolsable: {formatGuaranies(kit.garantia)}
          </span>
        </div>
      </section>

      {/* Qué incluye y Qué NO incluye */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-emerald-100 space-y-2.5">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-teal" />
            ¿Qué incluye este kit?
          </h3>
          <ul className="space-y-2">
            {kit.incluye.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-rose-100 space-y-2.5">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            ¿Qué NO incluye?
          </h3>
          <ul className="space-y-2">
            {kit.noIncluye.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Calendario Interactivo */}
      <Calendar
        kitId={kit.id}
        fechaRetiro={fechaRetiro}
        fechaDevolucion={fechaDevolucion}
        onChangeFechas={handleChangeFechas}
      />

      {/* Sección Upsell en vivo */}
      <section className="bg-gradient-to-r from-teal-50 via-white to-amber-50 rounded-3xl p-4 sm:p-5 shadow-card border-2 border-brand-teal/40">
        <label className="flex items-start gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agregaSonidoCasa}
            onChange={(e) => setAgregaSonidoCasa(e.target.checked)}
            className="mt-1 w-5 h-5 rounded-lg accent-brand-teal cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-teal text-white">
                <Volume2 className="w-3 h-3" /> ¡Oferta Combo Fiesta!
              </span>
              <span className="text-sm font-extrabold text-brand-teal">
                + {formatGuaranies(COSTO_UPSELL_SONIDO_CASA)}
              </span>
            </div>
            <p className="font-extrabold text-gray-900 text-sm sm:text-base mt-1">
              Agregá Sonido Fiesta Casa por Gs. 350.000 más
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Incluye Parlante Bluetooth 15" + Micrófono inalámbrico + Trípode para música y karaoke.
            </p>
          </div>
        </label>
      </section>

      {/* Resumen de Pago en vivo */}
      <PaymentSummary
        kitNombre={kit.nombre}
        precioBase={precioActual}
        precioOriginalPublico={kit.precioPublico}
        esDecoradora={esDecoradora}
        agregaSonidoCasa={agregaSonidoCasa}
        garantia={kit.garantia}
      />

      {alertaFecha && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {alertaFecha}
        </div>
      )}

      {/* Botón Continuar a Reserva */}
      <button
        type="button"
        onClick={handleContinuarReserva}
        className="w-full py-4 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-base shadow-lg shadow-brand-pink/25 transition transform active:scale-[0.99]"
      >
        Continuar a reserva →
      </button>
    </main>
  );
}
