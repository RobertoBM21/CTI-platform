import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    // eslint-disable-next-line @typescript-eslint/dot-notation
    uri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/cti-platform',
}));
