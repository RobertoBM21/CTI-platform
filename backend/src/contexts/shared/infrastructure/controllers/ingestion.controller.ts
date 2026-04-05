import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StixBundleDto } from '../../application/dtos/stix-bundle.dto';
import { BundleIngestionService } from '../../application/services/bundle-ingestion.service';

@ApiTags('Ingestion')
@Controller('ingestion')
export class IngestionController {
    constructor(
        private readonly bundleIngestionService: BundleIngestionService,
    ) {}

    @Post('bundles')
    @ApiOperation({ summary: 'Ingest a STIX 2.1 bundle' })
    @ApiOkResponse({ description: 'Bundle ingested successfully' })
    ingest(@Body() dto: StixBundleDto) {
        return this.bundleIngestionService.ingest(dto.objects);
    }
}
