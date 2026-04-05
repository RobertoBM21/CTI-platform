import { PaginatedResponse } from '../../application/dtos/pagination.dto';
import { SortCriteria } from '../../application/dtos/sort.dto';
import { Relationship } from '../entities/relationship.entity';

export abstract class RelationshipRepository {
    abstract findById(id: string): Promise<Relationship | null>;

    abstract findAll(
        filter: Partial<{
            relationshipType: string;
            sourceRef: string;
            targetRef: string;
            tlp: string;
        }>,
        page: number,
        limit: number,
        sort: SortCriteria,
    ): Promise<PaginatedResponse<Relationship>>;

    abstract findBySourceRef(sourceRef: string): Promise<Relationship[]>;

    abstract findByTargetRef(targetRef: string): Promise<Relationship[]>;

    abstract save(entity: Relationship): Promise<Relationship>;

    abstract update(
        id: string,
        entity: Partial<Relationship>,
    ): Promise<Relationship | null>;

    abstract delete(id: string): Promise<boolean>;
}
