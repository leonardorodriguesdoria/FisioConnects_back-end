import type { CookieOptions, Response } from 'express';

const AUTH_COOKIE_NAME = 'access_token';

function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const configured = (process.env.COOKIE_SAMESITE ?? 'lax').trim().toLowerCase();
  const sameSite = (['lax', 'strict', 'none'].includes(configured) ? configured : 'lax') as 'lax' | 'strict' | 'none';

  return {
    httpOnly: true,
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

export function setAuthCookie(response: Response, accessToken: string){
  response.cookie(AUTH_COOKIE_NAME, accessToken, {
    ...getAuthCookieOptions(),
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response: Response){
  response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
}
