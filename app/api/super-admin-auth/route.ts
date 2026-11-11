import { NextRequest } from 'next/server';
import { checkPinCookie, clearPinCookie, verifyPinAndSetCookie } from '@/lib/pin-auth';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'pym_super_admin_auth';
const getPin = () => process.env.SUPER_ADMIN_PIN || '9999';

export async function GET() {
  return checkPinCookie(COOKIE_NAME, getPin());
}

export async function POST(request: NextRequest) {
  return verifyPinAndSetCookie(request, COOKIE_NAME, getPin());
}

export async function DELETE() {
  return clearPinCookie(COOKIE_NAME);
}
