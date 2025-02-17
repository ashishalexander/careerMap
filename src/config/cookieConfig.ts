import { CookieOptions } from 'express';
export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true, // Prevent client-side access
    secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
    sameSite: 'lax', // Use 'lax' in development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    path: '/', // Default to root path
};  