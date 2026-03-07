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
    GetAttackPatternDetailUseCase,
    ListAttackPatternsUseCase,
} from '../../application/use-cases';

@ApiTags('Attack Patterns')
@Controller('attack-patterns')
export class AttackPatternsController {
    constructor(
        private readonly listAttackPatternsUseCase: ListAttackPatternsUseCase,
        private readonly getAttackPatternDetailUseCase: GetAttackPatternDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List attack patterns' })
    @ApiOkResponse({ description: 'Attack patterns retrieved successfully' })
    list(@Query() query: ThreatCatalogQueryDto) {
        return this.listAttackPatternsUseCase.execute(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attack pattern detail' })
    @ApiOkResponse({ description: 'Attack pattern retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Attack pattern not found' })
    async detail(@Param('id') id: string) {
        const attackPattern = await this.getAttackPatternDetailUseCase.execute({
            id,
        });

        if (!attackPattern) {
            throw new NotFoundException('Attack pattern not found');
        }

        return attackPattern;
    }
}
