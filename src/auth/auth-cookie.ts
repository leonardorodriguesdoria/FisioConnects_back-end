import type { Response } from 'express';

const AUTH_COOKIE_NAME = 'access_token';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

//Grava o token de acesso no cookie, usado no login e ao atualizar os dados do perfil
export function setAuthCookie(response: Response, accessToken: string){
  response.cookie(AUTH_COOKIE_NAME, accessToken, {
    ...authCookieOptions,
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response: Response){
  response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
}
