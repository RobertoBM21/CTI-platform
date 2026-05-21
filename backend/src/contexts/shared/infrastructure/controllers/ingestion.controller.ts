import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { StixBundleDto } from '../../application/dtos/stix-bundle.dto';
import { BundleIngestionService } from '../../application/services/bundle-ingestion.service';

@ApiTags('Ingestion')
@Controller('ingestion')
export class IngestionController {
    constructor(
        private readonly bundleIngestionService: BundleIngestionService,
    ) {}

    @Post('bundles')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Ingest a STIX 2.1 bundle' })
    @ApiOkResponse({
        description: 'Bundle ingested successfully',
        schema: {
            type: 'object',
            additionalProperties: true,
        },
    })
    @ApiBadRequestResponse({ description: 'Invalid STIX bundle payload' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid credentials' })
    ingest(@Body() dto: StixBundleDto) {
        return this.bundleIngestionService.ingest(dto.objects);
    }
}
