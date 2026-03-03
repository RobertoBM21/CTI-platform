import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    // eslint-disable-next-line @typescript-eslint/dot-notation
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    // eslint-disable-next-line @typescript-eslint/dot-notation
    environment: process.env['NODE_ENV'] ?? 'development',
}));
