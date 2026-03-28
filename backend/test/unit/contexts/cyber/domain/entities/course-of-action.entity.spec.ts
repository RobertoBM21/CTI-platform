import { CourseOfAction } from '../../../../../../src/contexts/cyber/domain/entities/course-of-action.entity';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('CourseOfAction', () => {
    describe('constructor with minimal props', () => {
        it('should create a CourseOfAction with only the name', () => {
            const coa = new CourseOfAction({ name: 'Block IP' });
            expect(coa.name).toBe('Block IP');
        });

        it('should generate an id when not provided', () => {
            const coa = new CourseOfAction({ name: 'Test' });
            expect(coa.id).toBeDefined();
            expect(typeof coa.id).toBe('string');
        });

        it('should default TLP to WHITE', () => {
            const coa = new CourseOfAction({ name: 'Test' });
            expect(coa.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const coa = new CourseOfAction({ name: 'Test' });
            expect(coa.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const coa = new CourseOfAction({
                id: 'coa-id-1',
                name: 'Block IP',
                description: 'Block malicious IP at firewall',
                confidence: 90,
                revoked: false,
                externalReferences: [
                    { sourceName: 'Playbook', externalId: 'COA-001' },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(coa.id).toBe('coa-id-1');
            expect(coa.name).toBe('Block IP');
            expect(coa.description).toBe('Block malicious IP at firewall');
            expect(coa.confidence).toBe(90);
            expect(coa.revoked).toBe(false);
            expect(coa.externalReferences).toEqual([
                { sourceName: 'Playbook', externalId: 'COA-001' },
            ]);
            expect(coa.tlp).toBe(TLP.AMBER);
            expect(coa.createdAt).toBe(now);
            expect(coa.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const coa = new CourseOfAction({ name: 'Test' });
            expect(coa.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const coa = new CourseOfAction({ name: 'Test' });
            expect(coa.revoked).toBe(false);
        });
    });
});
