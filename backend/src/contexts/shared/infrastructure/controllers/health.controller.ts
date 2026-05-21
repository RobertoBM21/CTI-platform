import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService, type HealthStatusResponse } from '../health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiOkResponse({
        description: 'Service health status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
                database: { type: 'string', example: 'connected' },
            },
        },
    })
    check(): HealthStatusResponse {
        return this.healthService.check();
    }
}
