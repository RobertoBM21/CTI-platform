import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/application/dtos/pagination.dto';
import { SortOrder } from '../../../shared/application/dtos/sort.dto';
import { IocType, TLP } from '../../domain';

export enum IndicatorListSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    VALUE = 'value',
    TYPE = 'type',
    NAME = 'name',
}

export interface IndicatorListQuery {
    page: number;
    limit: number;
    type?: IocType;
    value?: string;
    name?: string;
    tlp?: TLP;
    sortBy?: IndicatorListSortBy;
    sortOrder?: SortOrder;
}

export class IndicatorListQueryDto
    extends PaginationQueryDto
    implements IndicatorListQuery
{
    @ApiPropertyOptional({ enum: IocType, enumName: 'IocType' })
    @IsOptional()
    @IsEnum(IocType)
    type?: IocType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    value?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: TLP, enumName: 'TLP' })
    @IsOptional()
    @IsEnum(TLP)
    tlp?: TLP;

    @ApiPropertyOptional({
        enum: IndicatorListSortBy,
        enumName: 'IndicatorListSortBy',
        default: IndicatorListSortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(IndicatorListSortBy)
    sortBy: IndicatorListSortBy = IndicatorListSortBy.CREATED_AT;

    @ApiPropertyOptional({
        enum: SortOrder,
        enumName: 'SortOrder',
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: SortOrder = SortOrder.DESC;
}
