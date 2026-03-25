import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IocListQueryDto } from '../../application/dtos';
import { IocService } from '../../application/services';

@ApiTags('IoCs')
@Controller('iocs')
export class IocsController {
    constructor(private readonly iocService: IocService) {}

    @Get()
    @ApiOperation({ summary: 'List IoCs' })
    @ApiOkResponse({ description: 'IoCs retrieved successfully' })
    list(@Query() query: IocListQueryDto) {
        return this.iocService.list(query);
    }
}
