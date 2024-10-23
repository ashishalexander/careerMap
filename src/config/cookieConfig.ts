import { CookieOptions } from 'express';
export const COOKIE_OPTIONS:CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax', // Helps protect against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration: 7 days
};