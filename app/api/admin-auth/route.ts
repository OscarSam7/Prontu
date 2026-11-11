import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'pym_admin_auth';
const getAdminPin = () => process.env.ADMIN_PIN || '2026';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const expectedToken = Buffer.from(`pym-admin:${getAdminPin()}`).toString('base64');

  return NextResponse.json({
    authenticated: session?.value === expectedToken,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pin = String(body?.pin || '').trim();
    const expectedPin = getAdminPin();

    if (!pin || pin !== expectedPin) {
      return NextResponse.json(
        { ok: false, error: 'PIN incorrecto. Intentá de nuevo.' },
        { status: 401 }
      );
    }

    const token = Buffer.from(`pym-admin:${expectedPin}`).toString('base64');
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
