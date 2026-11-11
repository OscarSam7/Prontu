import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { clearPinCookie } from '@/lib/pin-auth';

const COOKIE_NAME = 'pym_admin_auth';
const DEFAULT_NEGOCIO_ID = 'neg-pegue-y-monte-cde';

async function getStoreCredentials() {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPin = process.env.ADMIN_PIN?.trim();

  let dbEmail: string | null = null;
  let dbPin: string | null = null;
  let dbWhatsapp = '0983637780';

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('negocios')
        .select('email_admin, pin_admin, whatsapp')
        .eq('id', DEFAULT_NEGOCIO_ID)
        .maybeSingle();

      if (data) {
        dbEmail = data.email_admin ? String(data.email_admin).trim().toLowerCase() : null;
        dbPin = data.pin_admin ? String(data.pin_admin).trim() : null;
        if (data.whatsapp) dbWhatsapp = String(data.whatsapp);
      }
    } catch {
      // Fallback a variables de entorno o defaults
    }
  }

  const validEmails = new Set<string>();
  if (envEmail) validEmails.add(envEmail);
  if (dbEmail) validEmails.add(dbEmail);
  if (validEmails.size === 0) validEmails.add('pegueymontecde@gmail.com');

  const validPins = new Set<string>();
  if (envPin) validPins.add(envPin);
  if (dbPin) validPins.add(dbPin);
  if (validPins.size === 0) validPins.add('2026');

  const sessionSecret = envPin || dbPin || '2026';

  return { validEmails, validPins, dbWhatsapp, sessionSecret };
}

export async function GET() {
  const { sessionSecret } = await getStoreCredentials();
  const cookieStore = cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const expectedToken = Buffer.from(`${COOKIE_NAME}:${sessionSecret}`).toString(
    'base64'
  );

  return NextResponse.json({
    authenticated: session?.value === expectedToken,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const pin = String(body?.pin || '').trim();

    const { validEmails, validPins, sessionSecret } = await getStoreCredentials();

    if (!email || !validEmails.has(email)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'El Gmail ingresado no coincide con el ID registrado de esta tienda.',
        },
        { status: 401 }
      );
    }

    if (!pin || !validPins.has(pin)) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña / PIN incorrecto. Intentá de nuevo.' },
        { status: 401 }
      );
    }

    const token = Buffer.from(`${COOKIE_NAME}:${sessionSecret}`).toString(
      'base64'
    );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Solicitud inválida' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const whatsapp = String(body?.whatsapp || '').trim();
    const nuevoPin = String(body?.nuevoPin || '').trim();

    const { validEmails, dbWhatsapp } = await getStoreCredentials();

    if (!email || !validEmails.has(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El Gmail ingresado no coincide con el registrado en la tienda.',
        },
        { status: 400 }
      );
    }

    const digitsInput = whatsapp.replace(/\D/g, '').replace(/^595/, '0');
    const digitsExpected = dbWhatsapp.replace(/\D/g, '').replace(/^595/, '0');

    if (!digitsInput || digitsInput.slice(-6) !== digitsExpected.slice(-6)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El número de WhatsApp no coincide con el de la tienda.',
        },
        { status: 400 }
      );
    }

    if (nuevoPin.length < 4) {
      return NextResponse.json(
        {
          ok: false,
          error: 'La nueva contraseña / PIN debe tener al menos 4 caracteres.',
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Para restablecer la contraseña desde la web necesitás Supabase conectado (o actualizá ADMIN_PIN en Netlify).',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('negocios')
      .update({ pin_admin: nuevoPin })
      .eq('id', DEFAULT_NEGOCIO_ID);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo actualizar la contraseña en Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        '¡Contraseña / PIN actualizada! Ya podés ingresar con tu Gmail y tu nueva clave.',
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Solicitud inválida' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  return clearPinCookie(COOKIE_NAME);
}
