'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Upload,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Download,
  Send,
  Sparkles,
  Building2,
} from 'lucide-react';
import {
  formatGuaranies,
  COSTO_DELIVERY_CDE,
  COSTO_UPSELL_SONIDO_CASA,
  DEFAULT_NEGOCIO_ID,
  Reserva,
} from '@/lib/kits';
import { uploadComprobanteFile } from '@/lib/media';
import { useApp } from '@/lib/store';

interface PagoViewProps {
  basePath?: string;
  negocioId?: string;
  negocioNombre?: string;
  whatsapp?: string;
  aliasSipap?: string;
  qrPagoUrl?: string;
}

export default function PagoView({
  basePath = '',
  negocioId = DEFAULT_NEGOCIO_ID,
  negocioNombre = 'Pegue y Monte CDE',
  whatsapp = '0983 637 780',
  aliasSipap = '3233591',
  qrPagoUrl,
}: PagoViewProps) {
  const {
    negocios,
    getKitsByNegocio,
    esDecoradora,
    draft,
    confirmarReservaYPago,
  } = useApp();

  const negocioMatch = negocios.find((n) => n.id === negocioId);
  const nombreTienda = negocioMatch?.nombre || negocioNombre;
  const whatsappTienda = negocioMatch?.whatsapp || whatsapp;
  const aliasTienda = negocioMatch?.aliasSipap || aliasSipap;
  const qrCobro = qrPagoUrl || negocioMatch?.qrPagoUrl;

  const storeKits = getKitsByNegocio(negocioId);
  const kit = storeKits.find((k) => k.id === draft.kitId) || storeKits[0];
  const precioBase = esDecoradora ? kit.precioDecoradora : kit.precioPublico;
  const costoUpsell = draft.agregaSonidoCasa ? COSTO_UPSELL_SONIDO_CASA : 0;
  const costoDelivery =
    draft.modalidadEntrega === 'delivery' ? COSTO_DELIVERY_CDE : 0;
  const precioTotal = precioBase + costoUpsell + costoDelivery;
  const sena50 = Math.round(precioTotal * 0.5);
  const saldoPendiente = precioTotal - sena50;

  const [metodo, setMetodo] = useState<'transferencia' | 'bancard' | 'pix'>(
    'transferencia'
  );
  const [comprobanteFile, setComprobanteFile] = useState<string>('');
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<Reserva | null>(
    null
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprobanteFile(file.name);
    setSubiendoComprobante(true);
    try {
      const url = await uploadComprobanteFile(file);
      setComprobanteUrl(url);
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const handleConfirmarPago = async () => {
    setProcesando(true);
    const nueva = confirmarReservaYPago(
      metodo,
      comprobanteFile || undefined,
      negocioId,
      comprobanteUrl || undefined
    );

    const payloadQR = JSON.stringify({
      tienda: nombreTienda,
      reserva: nueva.id,
      kit: nueva.kitNombre,
      cliente: nueva.clienteNombre,
      ci: nueva.clienteCi,
      retiro: nueva.fechaRetiro,
      senaPagada: nueva.sena50,
      saldoAlRetirar: nueva.saldoPendiente,
      garantia: nueva.garantia,
    });

    try {
      const url = await QRCode.toDataURL(payloadQR, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generando QR:', err);
    }

    setReservaConfirmada(nueva);
    setProcesando(false);
  };

  const handleDescargarPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!reservaConfirmada) return;
    const cleanPhone = whatsappTienda.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('595')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `595${cleanPhone.slice(1)}`
      : `595${cleanPhone}`;

    const mensaje = [
      `🎉 *RESERVA CONFIRMADA - ${nombreTienda.toUpperCase()}*`,
      `📋 *Código:* ${reservaConfirmada.id}`,
      `🎈 *Kit:* ${reservaConfirmada.kitNombre}`,
      `👤 *Cliente:* ${reservaConfirmada.clienteNombre} (CI: ${reservaConfirmada.clienteCi})`,
      `📅 *Retiro:* ${reservaConfirmada.fechaRetiro} | *Devolución:* ${reservaConfirmada.fechaDevolucion}`,
      `🚚 *Entrega:* ${
        reservaConfirmada.modalidadEntrega === 'delivery'
          ? 'Delivery'
          : 'Retiro en Local'
      }`,
      `💰 *Total:* ${formatGuaranies(reservaConfirmada.precioTotal)}`,
      `✅ *Seña 50% Abonada:* ${formatGuaranies(reservaConfirmada.sena50)} (${reservaConfirmada.metodoPago.toUpperCase()})`,
      `🔒 *Garantía Reembolsable:* ${formatGuaranies(reservaConfirmada.garantia)}`,
      ...(reservaConfirmada.requiereFactura
        ? [
            `🧾 *Facturación:* ${
              reservaConfirmada.facturacionRazonSocial ||
              reservaConfirmada.clienteNombre
            } | RUC: ${
              reservaConfirmada.facturacionRuc || reservaConfirmada.clienteCi
            }${
              reservaConfirmada.facturacionEmail
                ? ` | Email: ${reservaConfirmada.facturacionEmail}`
                : ''
            }`,
          ]
        : []),
    ].join('\n');

    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (reservaConfirmada) {
    return (
      <main className="px-4 pt-5 pb-12 space-y-5">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border-2 border-brand-teal space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-brand-teal flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-teal-50 text-brand-teal text-xs font-extrabold">
              SEÑA 50% CONFIRMADA
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              ¡Tu kit está reservado!
            </h1>
            <p className="text-xs text-gray-500">
              Presentá este código QR al retirar tu kit en {negocioNombre}
            </p>
          </div>

          <div className="bg-brand-bg rounded-3xl p-4 border border-pink-100 flex flex-col items-center justify-center space-y-2">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Código QR de Retiro"
                className="w-48 h-48 rounded-2xl shadow-sm border border-gray-200 bg-white p-2"
              />
            )}
            <span className="text-sm font-extrabold text-brand-pink tracking-wider">
              CÓDIGO: {reservaConfirmada.id}
            </span>
            <span className="text-[11px] text-gray-500">
              Escaneable por recepción en {negocioNombre}
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm border-t border-b border-gray-100 py-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-bold text-gray-900">
                {reservaConfirmada.clienteNombre} (CI: {reservaConfirmada.clienteCi})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kit Reservado:</span>
              <span className="font-bold text-gray-900">
                {reservaConfirmada.kitNombre}
              </span>
            </div>
            {reservaConfirmada.agregaSonidoCasa && (
              <div className="flex justify-between text-brand-teal font-semibold">
                <span>Adicional:</span>
                <span>+ Sonido Fiesta Casa ({formatGuaranies(350000)})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha Retiro / Devolución:</span>
              <span className="font-bold text-gray-900">
                {reservaConfirmada.fechaRetiro} al {reservaConfirmada.fechaDevolucion}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Modalidad:</span>
              <span className="font-bold text-gray-900 uppercase">
                {reservaConfirmada.modalidadEntrega === 'delivery'
                  ? 'Delivery (Gs. 80.000)'
                  : 'Retiro en Local'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dashed border-gray-200">
              <span className="text-gray-700 font-semibold">Total Alquiler:</span>
              <span className="font-extrabold text-gray-900">
                {formatGuaranies(reservaConfirmada.precioTotal)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>
                Seña 50% Pagada Hoy ({reservaConfirmada.metodoPago.toUpperCase()}):
              </span>
              <span>{formatGuaranies(reservaConfirmada.sena50)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Saldo a abonar al retirar:</span>
              <span className="font-bold">
                {formatGuaranies(reservaConfirmada.saldoPendiente)}
              </span>
            </div>
            <div className="flex justify-between text-teal-800 font-semibold">
              <span>Garantía reembolsable:</span>
              <span>{formatGuaranies(reservaConfirmada.garantia)}</span>
            </div>
            {reservaConfirmada.requiereFactura && (
              <div className="pt-2 border-t border-dashed border-gray-200 space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Facturación:</span>
                  <span className="font-bold text-gray-900">
                    {reservaConfirmada.facturacionRazonSocial ||
                      reservaConfirmada.clienteNombre}{' '}
                    (RUC:{' '}
                    {reservaConfirmada.facturacionRuc ||
                      reservaConfirmada.clienteCi}
                    )
                  </span>
                </div>
                {reservaConfirmada.facturacionEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Factura:</span>
                    <span className="font-semibold text-gray-700">
                      {reservaConfirmada.facturacionEmail}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
            <button
              type="button"
              onClick={handleDescargarPDF}
              className="py-3.5 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>

            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-4 h-4" />
              Enviar por WhatsApp
            </button>
          </div>

          <div className="text-center pt-1 no-print">
            <Link
              href={basePath || '/'}
              className="text-xs font-bold text-brand-pink hover:underline"
            >
              ← Volver al inicio de {negocioNombre}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}/reserva`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Editar datos
        </Link>
        <span className="text-xs font-extrabold text-brand-pink bg-pink-50 px-3 py-1.5 rounded-xl">
          Paso 2 de 2: Pago Seña 50%
        </span>
      </div>

      <section className="bg-gradient-to-br from-brand-pink to-rose-600 rounded-3xl p-5 text-white shadow-soft space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-pink-100">
          <span>KIT: {kit.nombre.toUpperCase()}</span>
          <span>
            {draft.fechaRetiro} → {draft.fechaDevolucion}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
          <div>
            <span className="text-[11px] text-pink-100 block">Total Alquiler</span>
            <span className="text-sm sm:text-base font-extrabold">
              {formatGuaranies(precioTotal)}
            </span>
          </div>
          <div className="border-x border-white/20">
            <span className="text-[11px] text-amber-200 font-bold block">
              Seña 50% Hoy
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              {formatGuaranies(sena50)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-pink-100 block">Garantía</span>
            <span className="text-sm sm:text-base font-extrabold">
              {formatGuaranies(kit.garantia)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-pink-100 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          El saldo restante ({formatGuaranies(saldoPendiente)}) y la garantía reembolsable se abonan al retirar.
        </p>
      </section>

      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <h2 className="font-extrabold text-gray-900 text-base">
          Elegí tu Método de Pago
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setMetodo('transferencia')}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition ${
              metodo === 'transferencia'
                ? 'border-brand-pink bg-pink-50 text-brand-pink font-extrabold'
                : 'border-gray-100 text-gray-600 font-semibold'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs">Transferencia / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setMetodo('bancard')}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition ${
              metodo === 'bancard'
                ? 'border-brand-pink bg-pink-50 text-brand-pink font-extrabold'
                : 'border-gray-100 text-gray-600 font-semibold'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">Tarjeta Bancard</span>
          </button>

          <button
            type="button"
            onClick={() => setMetodo('pix')}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition ${
              metodo === 'pix'
                ? 'border-brand-pink bg-pink-50 text-brand-pink font-extrabold'
                : 'border-gray-100 text-gray-600 font-semibold'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-xs">PIX (Brasil/CDE)</span>
          </button>
        </div>

        {metodo === 'transferencia' && (
          <div className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-3">
            <div className="text-xs space-y-1.5 text-gray-700">
              <p className="font-extrabold text-gray-900 text-sm">
                Datos Bancarios SIPAP / Alias Paraguay:
              </p>
              <p>
                • Titular: <strong>{nombreTienda}</strong>
              </p>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-pink-100">
                <span>
                  • Alias SIPAP:{' '}
                  <strong className="text-gray-900">
                    {aliasTienda || whatsappTienda}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      (aliasTienda || whatsappTienda).replace(/\s+/g, '')
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-pink-50 text-brand-pink font-bold text-[11px] hover:bg-brand-pink hover:text-white transition"
                >
                  Copiar
                </button>
              </div>
              <p>
                • WhatsApp comprobantes: <strong>{whatsappTienda}</strong>
              </p>
              <p>
                • Monto exacto a transferir:{' '}
                <strong className="text-brand-pink">
                  {formatGuaranies(sena50)}
                </strong>
              </p>
            </div>

            {qrCobro && (
              <div className="bg-white p-3 rounded-2xl border border-pink-100 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-gray-600 block">
                  Escaneá este QR para transferir la seña:
                </span>
                <img
                  src={qrCobro}
                  alt={`QR de cobro ${negocioNombre}`}
                  className="w-40 h-40 object-contain mx-auto rounded-xl"
                />
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Subir comprobante de transferencia (Foto o PDF):
              </label>
              <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-brand-pink/50 bg-white cursor-pointer hover:bg-pink-50/40 transition text-xs font-bold text-brand-pink">
                <Upload className="w-4 h-4" />
                <span>
                  {subiendoComprobante
                    ? 'Subiendo comprobante...'
                    : comprobanteFile
                    ? `Comprobante listo: ${comprobanteFile}`
                    : 'Seleccionar comprobante del celular'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {comprobanteUrl &&
              (comprobanteUrl.startsWith('data:image') ||
                comprobanteUrl.includes('fotos/') ||
                comprobanteUrl.includes('comprobantes/')) ? (
                <p className="text-[11px] text-emerald-700 font-semibold mt-1 text-center">
                  ✓ Imagen del comprobante adjuntada para verificación del Admin
                </p>
              ) : null}
            </div>
          </div>
        )}

        {metodo === 'bancard' && (
          <div className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-3">
            <p className="text-xs font-bold text-gray-800">
              Pago seguro vía vPOS Bancard (Débito, Crédito o QR Zimple/Infonet)
            </p>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Número de tarjeta (4500 •••• •••• ••••)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {metodo === 'pix' && (
          <div className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-2 text-xs text-gray-700">
            <p className="font-extrabold text-gray-900 text-sm">
              Pago instantáneo con PIX (Cotización automática)
            </p>
            <p>
              • Chave PIX / Tel:{' '}
              <strong>{aliasTienda || whatsappTienda}</strong>
            </p>
            <p>
              • Equivalente aprox.:{' '}
              <strong>R$ {Math.round(sena50 / 1350)},00</strong> (
              {formatGuaranies(sena50)})
            </p>
          </div>
        )}
      </section>

      <button
        type="button"
        disabled={procesando}
        onClick={handleConfirmarPago}
        className="w-full py-4 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-base shadow-lg shadow-brand-pink/30 flex items-center justify-center gap-2 transition"
      >
        <Sparkles className="w-5 h-5" />
        {procesando
          ? 'Generando QR de retiro...'
          : `Pagar seña 50% (${formatGuaranies(sena50)})`}
      </button>
    </main>
  );
}
