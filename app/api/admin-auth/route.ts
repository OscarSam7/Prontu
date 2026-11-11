import { NextRequest } from 'next/server';
import { checkPinCookie, clearPinCookie, verifyPinAndSetCookie } from '@/lib/pin-auth';

const COOKIE_NAME = 'pym_admin_auth';
const getPin = () => process.env.ADMIN_PIN || '2026';

export async function GET() {
  return checkPinCookie(COOKIE_NAME, getPin());
}

export async function POST(request: NextRequest) {
  return verifyPinAndSetCookie(request, COOKIE_NAME, getPin());
}

export async function DELETE() {
  return clearPinCookie(COOKIE_NAME);
}
