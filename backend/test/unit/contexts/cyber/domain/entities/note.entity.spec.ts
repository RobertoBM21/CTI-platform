import { Note } from '../../../../../../src/contexts/cyber/domain/entities/note.entity';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Note', () => {
    describe('constructor with minimal props', () => {
        it('should create a Note with only the content', () => {
            const note = new Note({ content: 'Analysis note' });
            expect(note.content).toBe('Analysis note');
        });

        it('should generate an id when not provided', () => {
            const note = new Note({ content: 'Test' });
            expect(note.id).toMatch(/^note--/);
        });

        it('should default TLP to WHITE', () => {
            const note = new Note({ content: 'Test' });
            expect(note.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const note = new Note({ content: 'Test' });
            expect(note.objectRefs).toEqual([]);
            expect(note.authors).toEqual([]);
            expect(note.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const note = new Note({
                id: 'note--note-id-1',
                content: 'This threat actor is linked to...',
                abstract: 'Threat actor analysis',
                objectRefs: ['threat-actor--abc', 'malware--def'],
                authors: ['analyst@cti.local'],
                confidence: 70,
                revoked: false,
                externalReferences: [
                    { sourceName: 'Internal', externalId: 'NOTE-001' },
                ],
                tlp: TLP.GREEN,
                createdAt: now,
                updatedAt: now,
            });

            expect(note.id).toBe('note--note-id-1');
            expect(note.content).toBe('This threat actor is linked to...');
            expect(note.abstract).toBe('Threat actor analysis');
            expect(note.objectRefs).toEqual([
                'threat-actor--abc',
                'malware--def',
            ]);
            expect(note.authors).toEqual(['analyst@cti.local']);
            expect(note.confidence).toBe(70);
            expect(note.revoked).toBe(false);
            expect(note.externalReferences).toEqual([
                { sourceName: 'Internal', externalId: 'NOTE-001' },
            ]);
            expect(note.tlp).toBe(TLP.GREEN);
            expect(note.createdAt).toBe(now);
            expect(note.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const note = new Note({ content: 'Test' });
            expect(note.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const note = new Note({ content: 'Test' });
            expect(note.revoked).toBe(false);
        });
    });
});
