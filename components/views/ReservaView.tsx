'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  CreditCard,
  Phone,
  MapPin,
  Truck,
  Store,
  FileText,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Mail,
} from 'lucide-react';
import {
  formatGuaranies,
  COSTO_DELIVERY_CDE,
  DEFAULT_NEGOCIO_ID,
} from '@/lib/kits';
import { useApp } from '@/lib/store';
import PaymentSummary from '@/components/PaymentSummary';

interface ReservaViewProps {
  basePath?: string;
  negocioId?: string;
  negocioNombre?: string;
  ciudadLabel?: string;
}

export default function ReservaView({
  basePath = '',
  negocioId = DEFAULT_NEGOCIO_ID,
  negocioNombre = 'Pegue y Monte CDE',
  ciudadLabel = 'Ciudad del Este',
}: ReservaViewProps) {
  const router = useRouter();
  const {
    getKitsByNegocio,
    esDecoradora,
    draft,
    updateDraft,
    rangoTieneConflicto,
  } = useApp();

  const storeKits = getKitsByNegocio(negocioId);
  const kit = storeKits.find((k) => k.id === draft.kitId) || storeKits[0];
  const precioBase = esDecoradora ? kit.precioDecoradora : kit.precioPublico;

  const [nombre, setNombre] = useState(draft.clienteNombre);
  const [ci, setCi] = useState(draft.clienteCi);
  const [whatsapp, setWhatsapp] = useState(draft.clienteWhatsapp);
  const [direccion, setDireccion] = useState(draft.direccionFiesta);
  const [requiereFactura, setRequiereFactura] = useState(draft.requiereFactura);
  const [facturacionRazonSocial, setFacturacionRazonSocial] = useState(
    draft.facturacionRazonSocial
  );
  const [facturacionRuc, setFacturacionRuc] = useState(draft.facturacionRuc);
  const [facturacionEmail, setFacturacionEmail] = useState(
    draft.facturacionEmail
  );
  const [facturacionDireccion, setFacturacionDireccion] = useState(
    draft.facturacionDireccion
  );
  const [modalidad, setModalidad] = useState<'retiro' | 'delivery'>(
    draft.modalidadEntrega
  );
  const [aceptaContrato, setAceptaContrato] = useState(draft.aceptaContrato);
  const [verContrato, setVerContrato] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ci.trim() || !whatsapp.trim() || !direccion.trim()) {
      setError(
        'Por favor completá todos tus datos personales y la dirección de la fiesta.'
      );
      return;
    }

    if (
      requiereFactura &&
      (!facturacionRazonSocial.trim() || !facturacionRuc.trim())
    ) {
      setError(
        'Completá la Razón Social / Nombre y el RUC / CI para la facturación.'
      );
      return;
    }

    if (rangoTieneConflicto(kit.id, draft.fechaRetiro, draft.fechaDevolucion)) {
      setError(
        'Este kit ya fue reservado en las fechas seleccionadas. Por favor elegí otra fecha o kit.'
      );
      return;
    }

    if (!aceptaContrato) {
      setError(
        'Debés aceptar el contrato de alquiler y cuidado de piezas para continuar.'
      );
      return;
    }

    setError(null);
    updateDraft({
      clienteNombre: nombre.trim(),
      clienteCi: ci.trim(),
      clienteWhatsapp: whatsapp.trim(),
      direccionFiesta: direccion.trim(),
      requiereFactura,
      facturacionRazonSocial: requiereFactura
        ? facturacionRazonSocial.trim()
        : '',
      facturacionRuc: requiereFactura ? facturacionRuc.trim() : '',
      facturacionEmail: requiereFactura ? facturacionEmail.trim() : '',
      facturacionDireccion: requiereFactura ? facturacionDireccion.trim() : '',
      modalidadEntrega: modalidad,
      aceptaContrato: true,
    });

    router.push(`${basePath}/pago`);
  };

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}/kit/${kit.id}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al kit
        </Link>
        <span className="text-xs font-extrabold text-brand-pink bg-pink-50 px-3 py-1.5 rounded-xl">
          Paso 1 de 2: Datos de Reserva
        </span>
      </div>

      <section className="bg-white rounded-3xl p-4 shadow-card border border-pink-100 flex items-center gap-3.5">
        <img
          src={kit.fotos[0]}
          alt={kit.nombre}
          className="w-20 h-20 rounded-2xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-brand-teal uppercase">
            {kit.categoria}
          </span>
          <h1 className="font-extrabold text-gray-900 text-base truncate">
            {kit.nombre}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Retiro: <strong>{draft.fechaRetiro}</strong> • Devolución:{' '}
            <strong>{draft.fechaDevolucion}</strong>
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <select
              value={kit.id}
              onChange={(e) => updateDraft({ kitId: Number(e.target.value) })}
              className="text-xs bg-brand-bg border border-pink-200 rounded-xl px-2.5 py-1 font-semibold text-gray-700"
            >
              {storeKits.map((k) => (
                <option key={k.id} value={k.id}>
                  Cambiar: #{k.id} {k.nombre} (
                  {formatGuaranies(
                    esDecoradora ? k.precioDecoradora : k.precioPublico
                  )}
                  )
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
          <h2 className="font-extrabold text-gray-900 text-base">
            Tus Datos para el Contrato
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nombre y Apellido completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María Fernanda Benítez"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-pink-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  N° de Cédula (CI) o RUC *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    placeholder="Ej: 4.582.910"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-pink-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp de contacto *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 0983 412 890"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-pink-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dirección exacta del evento / fiesta *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={2}
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder={`Barrio, calle y referencia en ${ciudadLabel}`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            {/* Opción Datos para Facturación */}
            <div className="pt-2 border-t border-pink-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiereFactura}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setRequiereFactura(checked);
                      if (checked) {
                        if (!facturacionRazonSocial && nombre) {
                          setFacturacionRazonSocial(nombre);
                        }
                        if (!facturacionRuc && ci) {
                          setFacturacionRuc(ci);
                        }
                        if (!facturacionDireccion && direccion) {
                          setFacturacionDireccion(direccion);
                        }
                      }
                    }}
                    className="w-4 h-4 rounded accent-brand-pink cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-gray-800 inline-flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-brand-pink" />
                    Agregar Datos para Facturación (Factura Legal)
                  </span>
                </label>

                {requiereFactura && (
                  <button
                    type="button"
                    onClick={() => {
                      setFacturacionRazonSocial(nombre);
                      setFacturacionRuc(ci);
                      setFacturacionDireccion(direccion);
                    }}
                    className="text-[11px] font-bold text-brand-teal underline"
                  >
                    Copiar datos del contrato
                  </button>
                )}
              </div>

              {requiereFactura && (
                <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Razón Social o Nombre para Factura *
                      </label>
                      <input
                        type="text"
                        required={requiereFactura}
                        value={facturacionRazonSocial}
                        onChange={(e) =>
                          setFacturacionRazonSocial(e.target.value)
                        }
                        placeholder="Ej: Eventos CDE S.R.L. o María Benítez"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        RUC / CI para Facturación *
                      </label>
                      <input
                        type="text"
                        required={requiereFactura}
                        value={facturacionRuc}
                        onChange={(e) => setFacturacionRuc(e.target.value)}
                        placeholder="Ej: 80012345-6 o 4.582.910-0"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Correo para envío de Factura (opcional)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={facturacionEmail}
                          onChange={(e) => setFacturacionEmail(e.target.value)}
                          placeholder="ejemplo@gmail.com"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-pink-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Dirección Fiscal (opcional)
                      </label>
                      <input
                        type="text"
                        value={facturacionDireccion}
                        onChange={(e) =>
                          setFacturacionDireccion(e.target.value)
                        }
                        placeholder="Dirección que figurará en la factura"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
          <h2 className="font-extrabold text-gray-900 text-base">
            Modalidad de Entrega
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModalidad('retiro')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                modalidad === 'retiro'
                  ? 'border-brand-pink bg-pink-50/70'
                  : 'border-gray-100 hover:border-pink-200'
              }`}
            >
              <div className="p-2 rounded-xl bg-white text-brand-pink shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">
                    Retiro en Local
                  </span>
                  <span className="text-xs font-extrabold text-brand-teal">
                    GRATIS
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Entra en cualquier auto. Retiro en {ciudadLabel}.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setModalidad('delivery')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                modalidad === 'delivery'
                  ? 'border-brand-pink bg-pink-50/70'
                  : 'border-gray-100 hover:border-pink-200'
              }`}
            >
              <div className="p-2 rounded-xl bg-white text-brand-pink shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">
                    Delivery
                  </span>
                  <span className="text-xs font-extrabold text-brand-pink">
                    + {formatGuaranies(COSTO_DELIVERY_CDE)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Te llevamos y retiramos en la puerta de tu evento.
                </p>
              </div>
            </button>
          </div>
        </div>

        <PaymentSummary
          kitNombre={kit.nombre}
          precioBase={precioBase}
          precioOriginalPublico={kit.precioPublico}
          esDecoradora={esDecoradora}
          agregaSonidoCasa={draft.agregaSonidoCasa}
          modalidadEntrega={modalidad}
          garantia={kit.garantia}
          mostrarDelivery={true}
        />

        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-pink" />
              Contrato de Alquiler • {negocioNombre}
            </span>
            <button
              type="button"
              onClick={() => setVerContrato(!verContrato)}
              className="text-xs font-bold text-brand-pink underline"
            >
              {verContrato ? 'Ocultar cláusulas' : 'Leer cláusulas'}
            </button>
          </div>

          {verContrato && (
            <div className="p-3 rounded-2xl bg-brand-bg text-xs text-gray-600 space-y-1.5 border border-pink-100">
              <p>
                <strong>1. Reserva:</strong> Se confirma abonando el 50% de seña. El 50% restante + la garantía reembolsable ({formatGuaranies(kit.garantia)}) se abonan al retirar el kit.
              </p>
              <p>
                <strong>2. Devolución y Garantía:</strong> La garantía se devuelve íntegramente al entregar el kit en buen estado. En caso de roturas o faltantes, se descuentan según tarifario oficial (Panel Gs. 450.000, Cilindro Gs. 180.000, Arco Gs. 350.000, Parlante Gs. 2.000.000, Proyector/TV Gs. 3.500.000, Micrófono Gs. 400.000).
              </p>
              <p>
                <strong>3. Puntualidad:</strong> La devolución se realiza en la fecha pactada ({draft.fechaDevolucion}) hasta las 18:00 hs.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={aceptaContrato}
              onChange={(e) => setAceptaContrato(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-lg accent-brand-pink cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              Acepto los términos del contrato de alquiler, depósito en garantía reembolsable y cuidado de los equipos de {negocioNombre}.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-base shadow-lg shadow-brand-pink/25 flex items-center justify-center gap-2 transition"
        >
          <CheckCircle2 className="w-5 h-5" />
          Ir a Pagar Seña 50% →
        </button>
      </form>
    </main>
  );
}
