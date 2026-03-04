import { IocSourceType } from '../../domain';

export interface IocListQueryDto {
    page: number;
    limit: number;
    type?: string;
    value?: string;
    tlp?: string;
    sourceType?: IocSourceType;
    sourceId?: string;
}
