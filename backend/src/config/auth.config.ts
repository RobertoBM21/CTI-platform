import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret:
        process.env.JWT_SECRET ??
        'insecure-default-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    googleCallbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3000/auth/google/callback',
}));
