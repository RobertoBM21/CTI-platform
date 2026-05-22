import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import {
    type SortCriteria,
    SortOrder,
} from '../../../shared/application/dtos/sort.dto';
import { Report, ReportRepository } from '../../domain';
import { ReportCatalogQueryDto } from '../dtos/report-catalog-query.dto';

@Injectable()
export class ReportService {
    constructor(private readonly reportRepository: ReportRepository) {}

    list(query: ReportCatalogQueryDto): Promise<PaginatedResponse<Report>> {
        const sort: SortCriteria = {
            field: query.sortBy,
            direction: query.sortOrder === SortOrder.ASC ? 1 : -1,
        };

        return this.reportRepository.findAll(
            {
                name: query.name,
                tlp: query.tlp,
            },
            query.page,
            query.limit,
            sort,
        );
    }

    findById(id: string): Promise<Report | null> {
        return this.reportRepository.findById(id);
    }

    findByObjectRef(objectRef: string): Promise<Report[]> {
        return this.reportRepository.findByObjectRef(objectRef);
    }

    save(entity: Report): Promise<Report> {
        return this.reportRepository.save(entity);
    }
}
