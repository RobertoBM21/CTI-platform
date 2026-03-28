import { PaginatedResponse } from '../../../shared/application/dtos/pagination.dto';
import { SortCriteria } from '../../../shared/application/dtos/sort.dto';
import { CourseOfAction } from '../entities/course-of-action.entity';

export abstract class CourseOfActionRepository {
    abstract findById(id: string): Promise<CourseOfAction | null>;

    abstract findAll(
        filter: Partial<{ name: string; tlp: string }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<CourseOfAction>>;

    abstract findByName(name: string): Promise<CourseOfAction | null>;

    abstract create(entity: CourseOfAction): Promise<CourseOfAction>;

    abstract update(
        id: string,
        entity: Partial<CourseOfAction>,
    ): Promise<CourseOfAction | null>;

    abstract delete(id: string): Promise<boolean>;
}
