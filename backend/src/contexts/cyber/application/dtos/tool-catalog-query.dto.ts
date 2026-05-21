import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/application/dtos/pagination.dto';
import { SortOrder } from '../../../shared/application/dtos/sort.dto';
import { TLP } from '../../domain';

export enum ToolCatalogSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    NAME = 'name',
}

export class ToolCatalogQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: TLP, enumName: 'TLP' })
    @IsOptional()
    @IsEnum(TLP)
    tlp?: TLP;

    @ApiPropertyOptional({
        enum: ToolCatalogSortBy,
        enumName: 'ToolCatalogSortBy',
        default: ToolCatalogSortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(ToolCatalogSortBy)
    sortBy: ToolCatalogSortBy = ToolCatalogSortBy.CREATED_AT;

    @ApiPropertyOptional({
        enum: SortOrder,
        enumName: 'SortOrder',
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = SortOrder.DESC;
}
