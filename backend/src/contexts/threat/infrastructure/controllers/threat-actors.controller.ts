import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { ThreatCatalogQueryDto } from '../../application/dtos';
import {
    GetThreatActorDetailUseCase,
    ListThreatActorsUseCase,
} from '../../application/use-cases';

@ApiTags('Threat Actors')
@Controller('threat-actors')
export class ThreatActorsController {
    constructor(
        private readonly listThreatActorsUseCase: ListThreatActorsUseCase,
        private readonly getThreatActorDetailUseCase: GetThreatActorDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List threat actors' })
    @ApiOkResponse({ description: 'Threat actors retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.listThreatActorsUseCase.execute(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get threat actor detail' })
    @ApiOkResponse({ description: 'Threat actor retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Threat actor not found' })
    async detail(@Param('id') id: string) {
        const threatActor = await this.getThreatActorDetailUseCase.execute({
            id,
        });

        if (!threatActor) {
            throw new NotFoundException('Threat actor not found');
        }

        return threatActor;
    }
}
