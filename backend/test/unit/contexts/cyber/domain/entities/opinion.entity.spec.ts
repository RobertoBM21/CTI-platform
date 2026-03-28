import { Opinion } from '../../../../../../src/contexts/cyber/domain/entities/opinion.entity';
import { OpinionValue } from '../../../../../../src/contexts/cyber/domain/value-objects/opinion-value.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Opinion', () => {
    describe('constructor with minimal props', () => {
        it('should create an Opinion with only the opinion value', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.AGREE,
            });
            expect(opinion.opinion).toBe(OpinionValue.AGREE);
        });

        it('should generate an id when not provided', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.NEUTRAL,
            });
            expect(opinion.id).toBeDefined();
            expect(typeof opinion.id).toBe('string');
        });

        it('should default TLP to WHITE', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.NEUTRAL,
            });
            expect(opinion.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.NEUTRAL,
            });
            expect(opinion.objectRefs).toEqual([]);
            expect(opinion.authors).toEqual([]);
            expect(opinion.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const opinion = new Opinion({
                id: 'opinion-id-1',
                opinion: OpinionValue.STRONGLY_AGREE,
                objectRefs: ['indicator--abc'],
                explanation: 'Confirmed by multiple sources',
                authors: ['analyst@cti.local'],
                confidence: 95,
                revoked: false,
                externalReferences: [
                    {
                        sourceName: 'Internal',
                        externalId: 'OP-001',
                    },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(opinion.id).toBe('opinion-id-1');
            expect(opinion.opinion).toBe(OpinionValue.STRONGLY_AGREE);
            expect(opinion.objectRefs).toEqual(['indicator--abc']);
            expect(opinion.explanation).toBe('Confirmed by multiple sources');
            expect(opinion.authors).toEqual(['analyst@cti.local']);
            expect(opinion.confidence).toBe(95);
            expect(opinion.revoked).toBe(false);
            expect(opinion.externalReferences).toEqual([
                { sourceName: 'Internal', externalId: 'OP-001' },
            ]);
            expect(opinion.tlp).toBe(TLP.AMBER);
            expect(opinion.createdAt).toBe(now);
            expect(opinion.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.NEUTRAL,
            });
            expect(opinion.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const opinion = new Opinion({
                opinion: OpinionValue.NEUTRAL,
            });
            expect(opinion.revoked).toBe(false);
        });
    });
});
