import { RelationshipService } from '../../../../../../src/contexts/shared/application/services/relationship.service';
import {
    Relationship,
    RelationshipRepository,
} from '../../../../../../src/contexts/shared/domain';
import { RelationshipType } from '../../../../../../src/contexts/shared/domain/value-objects/relationship-type.vo';

describe('RelationshipService', () => {
    const rel = new Relationship({
        id: 'relationship--r1',
        relationshipType: RelationshipType.USES,
        sourceRef: 'threat-actor--ta1',
        targetRef: 'malware--m1',
    });

    function createRepository(
        overrides: Partial<RelationshipRepository> = {},
    ): RelationshipRepository {
        return {
            findById: jest.fn().mockResolvedValue(rel),
            findBySourceRef: jest.fn().mockResolvedValue([rel]),
            findByTargetRef: jest.fn().mockResolvedValue([rel]),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            ...overrides,
        };
    }

    it('should delegate findById to repository', async () => {
        const repository = createRepository();
        const service = new RelationshipService(repository);

        const result = await service.findById('relationship--r1');

        expect(repository.findById).toHaveBeenCalledWith('relationship--r1');
        expect(result?.id).toBe('relationship--r1');
    });

    it('should delegate findBySourceRef to repository', async () => {
        const repository = createRepository();
        const service = new RelationshipService(repository);

        const result = await service.findBySourceRef('threat-actor--ta1');

        expect(repository.findBySourceRef).toHaveBeenCalledWith(
            'threat-actor--ta1',
        );
        expect(result).toHaveLength(1);
    });

    it('should delegate findByTargetRef to repository', async () => {
        const repository = createRepository();
        const service = new RelationshipService(repository);

        const result = await service.findByTargetRef('malware--m1');

        expect(repository.findByTargetRef).toHaveBeenCalledWith('malware--m1');
        expect(result).toHaveLength(1);
    });

    it('should return null when not found', async () => {
        const repository = createRepository({
            findById: jest.fn().mockResolvedValue(null),
        });
        const service = new RelationshipService(repository);

        const result = await service.findById('relationship--missing');

        expect(result).toBeNull();
    });
});
