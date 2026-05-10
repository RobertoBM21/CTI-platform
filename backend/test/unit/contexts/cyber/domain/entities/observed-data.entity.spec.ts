import { ObservedData } from '../../../../../../src/contexts/cyber/domain/entities/observed-data.entity';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('ObservedData', () => {
    const first = new Date('2023-09-01T00:00:00Z');
    const last = new Date('2023-09-30T23:59:59Z');

    describe('constructor with minimal props', () => {
        it('should create an ObservedData with required fields', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 5,
            });
            expect(od.firstObserved).toBe(first);
            expect(od.lastObserved).toBe(last);
            expect(od.numberObserved).toBe(5);
        });

        it('should generate an id when not provided', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.id).toMatch(/^observed-data--/);
        });

        it('should default TLP to WHITE', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.objectRefs).toEqual([]);
            expect(od.externalReferences).toEqual([]);
        });

        it('should default revoked to false', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.revoked).toBe(false);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.createdAt).toBeInstanceOf(Date);
            expect(od.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const od = new ObservedData({
                firstObserved: first,
                lastObserved: last,
                numberObserved: 1,
            });
            expect(od.confidence).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const od = new ObservedData({
                id: 'observed-data--od-id-1',
                firstObserved: first,
                lastObserved: last,
                numberObserved: 42,
                objectRefs: ['ipv4-addr--a1b2', 'domain-name--c3d4'],
                confidence: 80,
                revoked: false,
                externalReferences: [
                    { sourceName: 'SIEM', externalId: 'ALERT-2023-009' },
                ],
                tlp: TLP.GREEN,
                createdAt: now,
                updatedAt: now,
            });

            expect(od.id).toBe('observed-data--od-id-1');
            expect(od.firstObserved).toBe(first);
            expect(od.lastObserved).toBe(last);
            expect(od.numberObserved).toBe(42);
            expect(od.objectRefs).toEqual([
                'ipv4-addr--a1b2',
                'domain-name--c3d4',
            ]);
            expect(od.confidence).toBe(80);
            expect(od.revoked).toBe(false);
            expect(od.externalReferences).toEqual([
                { sourceName: 'SIEM', externalId: 'ALERT-2023-009' },
            ]);
            expect(od.tlp).toBe(TLP.GREEN);
            expect(od.createdAt).toBe(now);
            expect(od.updatedAt).toBe(now);
        });
    });
});
