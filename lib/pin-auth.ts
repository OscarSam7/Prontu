import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function checkPinCookie(cookieName: string, expectedPin: string) {
  const cookieStore = cookies();
  const session = cookieStore.get(cookieName);
  const expectedToken = Buffer.from(`${cookieName}:${expectedPin}`).toString('base64');
  return NextResponse.json({
    authenticated: session?.value === expectedToken,
  });
}

export async function verifyPinAndSetCookie(
  request: NextRequest,
  cookieName: string,
  expectedPin: string
) {
  try {
    const body = await request.json();
    const pin = String(body?.pin || '').trim();

    if (!pin || pin !== expectedPin) {
      return NextResponse.json(
        { ok: false, error: 'PIN incorrecto. Intentá de nuevo.' },
        { status: 401 }
      );
    }

    const token = Buffer.from(`${cookieName}:${expectedPin}`).toString('base64');
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida' }, { status: 400 });
  }
}

export function clearPinCookie(cookieName: string) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
