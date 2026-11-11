'use client';

import React, { useState, useEffect } from 'react';
import { Upload, QrCode, Image as ImageIcon, Trash2, CheckCircle2, Mail, Lock } from 'lucide-react';
import { Negocio } from '@/lib/saas';
import { uploadMediaImage } from '@/lib/media';
import { useApp } from '@/lib/store';

interface StoreBrandingEditorProps {
  negocio: Negocio;
}

export default function StoreBrandingEditor({
  negocio,
}: StoreBrandingEditorProps) {
  const { actualizarNegocio } = useApp();

  const [nombre, setNombre] = useState(negocio.nombre);
  const [ciudad, setCiudad] = useState(negocio.ciudad);
  const [whatsapp, setWhatsapp] = useState(negocio.whatsapp);
  const [aliasSipap, setAliasSipap] = useState(negocio.aliasSipap);
  const [colorPrimario, setColorPrimario] = useState(negocio.colorPrimario);
  const [emailAdmin, setEmailAdmin] = useState(negocio.emailAdmin || '');
  const [pinAdmin, setPinAdmin] = useState(negocio.pinAdmin || '2026');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(negocio.logoUrl);
  const [portadaUrl, setPortadaUrl] = useState<string | undefined>(
    negocio.portadaUrl
  );
  const [qrPagoUrl, setQrPagoUrl] = useState<string | undefined>(
    negocio.qrPagoUrl
  );
  const [subiendo, setSubiendo] = useState(false);
  const [guardadoMsg, setGuardadoMsg] = useState<string | null>(null);

  useEffect(() => {
    setNombre(negocio.nombre);
    setCiudad(negocio.ciudad);
    setWhatsapp(negocio.whatsapp);
    setAliasSipap(negocio.aliasSipap);
    setColorPrimario(negocio.colorPrimario);
    setEmailAdmin(negocio.emailAdmin || '');
    setPinAdmin(negocio.pinAdmin || '2026');
    setLogoUrl(negocio.logoUrl);
    setPortadaUrl(negocio.portadaUrl);
    setQrPagoUrl(negocio.qrPagoUrl);
  }, [negocio]);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: 'logos' | 'portadas' | 'qr-pagos',
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const url = await uploadMediaImage(file, folder);
      setter(url);
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarNegocio({
      ...negocio,
      nombre: nombre.trim() || negocio.nombre,
      ciudad: ciudad.trim() || negocio.ciudad,
      whatsapp: whatsapp.trim() || negocio.whatsapp,
      aliasSipap: aliasSipap.trim(),
      colorPrimario,
      emailAdmin: emailAdmin.trim().toLowerCase() || negocio.emailAdmin,
      pinAdmin: pinAdmin.trim() || negocio.pinAdmin,
      logoUrl,
      portadaUrl,
      qrPagoUrl,
    });
    setGuardadoMsg('¡Cambios de tu tienda, logo y portada guardados!');
    setTimeout(() => setGuardadoMsg(null), 4000);
  };

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-pink-100 space-y-4">
      <div>
        <h2 className="font-extrabold text-gray-900 text-base sm:text-lg">
          Personalizá tu Tienda, Logo, Portada y Cobros
        </h2>
        <p className="text-xs text-gray-500">
          Todo lo que cambies acá se actualiza en tu página de inicio, catálogo y pantalla de pago.
        </p>
      </div>

      <form onSubmit={handleGuardar} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Ciudad / Ubicación
            </label>
            <input
              type="text"
              required
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              WhatsApp (Reservas)
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Alias SIPAP
            </label>
            <input
              type="text"
              value={aliasSipap}
              onChange={(e) => setAliasSipap(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Color Principal
            </label>
            <input
              type="color"
              value={colorPrimario}
              onChange={(e) => setColorPrimario(e.target.value)}
              className="w-full h-10 rounded-xl border border-pink-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Credenciales de Acceso (Gmail ID + Contraseña / PIN) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
          <span className="font-extrabold text-gray-800 block">
            Credenciales de Acceso al Panel Admin
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-pink" />
                Gmail de acceso (ID)
              </label>
              <input
                type="email"
                required
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                placeholder="tucorreo@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-pink" />
                Contraseña / PIN
              </label>
              <input
                type="text"
                required
                minLength={4}
                value={pinAdmin}
                onChange={(e) => setPinAdmin(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Subida de Portada (Hero Banner) */}
        <div className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-pink" />
              Foto de Portada (Banner principal)
            </span>
            {portadaUrl && (
              <button
                type="button"
                onClick={() => setPortadaUrl(undefined)}
                className="text-rose-600 font-bold inline-flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Quitar portada
              </button>
            )}
          </div>

          {portadaUrl && (
            <img
              src={portadaUrl}
              alt="Portada tienda"
              className="w-full h-36 object-cover rounded-2xl border border-pink-200"
            />
          )}

          <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-pink-200 text-brand-pink font-bold cursor-pointer hover:bg-pink-50 transition">
            <Upload className="w-4 h-4" />
            {subiendo
              ? 'Subiendo imagen...'
              : portadaUrl
              ? 'Cambiar Foto de Portada'
              : 'Alzar Foto de Portada'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'portadas', setPortadaUrl)}
              className="hidden"
            />
          </label>
        </div>

        {/* Subida de Logo y QR de Cobro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-2 text-center">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-gray-800">Logo del Negocio</span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl(undefined)}
                  className="text-rose-600 font-bold text-[11px]"
                >
                  Quitar
                </button>
              )}
            </div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo tienda"
                className="w-20 h-20 rounded-2xl object-cover mx-auto border border-pink-200 bg-white"
              />
            )}
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-brand-pink font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {subiendo ? 'Subiendo...' : logoUrl ? 'Cambiar Logo' : 'Alzar Logo'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'logos', setLogoUrl)}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-2 text-center">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-gray-800 flex items-center gap-1">
                <QrCode className="w-4 h-4 text-brand-teal" />
                QR Transferencia / PIX
              </span>
              {qrPagoUrl && (
                <button
                  type="button"
                  onClick={() => setQrPagoUrl(undefined)}
                  className="text-rose-600 font-bold text-[11px]"
                >
                  Quitar
                </button>
              )}
            </div>
            {qrPagoUrl && (
              <img
                src={qrPagoUrl}
                alt="QR cobro"
                className="w-24 h-24 rounded-xl object-contain mx-auto bg-white p-1 border border-pink-200"
              />
            )}
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-teal-200 text-brand-teal font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {subiendo
                ? 'Subiendo...'
                : qrPagoUrl
                ? 'Cambiar QR'
                : 'Alzar Foto de QR'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'qr-pagos', setQrPagoUrl)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {guardadoMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{guardadoMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={subiendo}
          className="w-full py-3.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold shadow transition disabled:opacity-60"
        >
          Guardar Tienda, Portada y Logo
        </button>
      </form>
    </section>
  );
}
