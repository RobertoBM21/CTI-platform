import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { Report } from '../entities/report.entity';

export abstract class ReportRepository {
    abstract findById(id: string): Promise<Report | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Report>>;

    abstract save(entity: Report): Promise<Report>;

    abstract update(
        id: string,
        entity: Partial<Report>,
    ): Promise<Report | null>;

    abstract delete(id: string): Promise<boolean>;
}
