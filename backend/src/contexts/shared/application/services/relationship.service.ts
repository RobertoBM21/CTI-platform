import { Injectable } from '@nestjs/common';
import { Relationship, RelationshipRepository } from '../../domain';

@Injectable()
export class RelationshipService {
    constructor(
        private readonly relationshipRepository: RelationshipRepository,
    ) {}

    findById(id: string): Promise<Relationship | null> {
        return this.relationshipRepository.findById(id);
    }

    findBySourceRef(sourceRef: string): Promise<Relationship[]> {
        return this.relationshipRepository.findBySourceRef(sourceRef);
    }

    findByTargetRef(targetRef: string): Promise<Relationship[]> {
        return this.relationshipRepository.findByTargetRef(targetRef);
    }
}
