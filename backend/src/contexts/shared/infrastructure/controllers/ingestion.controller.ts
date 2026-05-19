import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiSecurity,
    ApiTags,
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
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Ingest a STIX 2.1 bundle' })
    @ApiOkResponse({ description: 'Bundle ingested successfully' })
    ingest(@Body() dto: StixBundleDto) {
        return this.bundleIngestionService.ingest(dto.objects);
    }
}
