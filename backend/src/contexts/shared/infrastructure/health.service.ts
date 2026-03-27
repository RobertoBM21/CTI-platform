import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

export interface HealthStatusResponse {
    status: 'ok' | 'degraded';
    timestamp: string;
    database: {
        status: 'up' | 'down';
    };
}

@Injectable()
export class HealthService {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    check(): HealthStatusResponse {
        const isDatabaseUp =
            this.connection.readyState === ConnectionStates.connected;

        return {
            status: isDatabaseUp ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            database: {
                status: isDatabaseUp ? 'up' : 'down',
            },
        };
    }
}
