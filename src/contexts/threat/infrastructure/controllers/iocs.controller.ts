import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IocListQueryDto } from '../../application/dtos';
import { ListIocsUseCase } from '../../application/use-cases';

@ApiTags('IoCs')
@Controller('iocs')
export class IocsController {
    constructor(private readonly listIocsUseCase: ListIocsUseCase) {}

    @Get()
    @ApiOperation({ summary: 'List IoCs' })
    @ApiOkResponse({ description: 'IoCs retrieved successfully' })
    list(@Query() query: IocListQueryDto) {
        return this.listIocsUseCase.execute(query);
    }
}
