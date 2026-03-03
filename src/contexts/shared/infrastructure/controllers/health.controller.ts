import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiOkResponse({ description: 'Service is healthy' })
    check(): { status: string; timestamp: string } {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
