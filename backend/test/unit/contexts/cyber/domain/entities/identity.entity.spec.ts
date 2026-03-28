import { Identity } from '../../../../../../src/contexts/cyber/domain/entities/identity.entity';
import { IdentityClass } from '../../../../../../src/contexts/cyber/domain/value-objects/identity-class.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Identity', () => {
    describe('constructor with minimal props', () => {
        it('should create an Identity with only the name', () => {
            const identity = new Identity({ name: 'ACME Corp' });
            expect(identity.name).toBe('ACME Corp');
        });

        it('should generate an id when not provided', () => {
            const identity = new Identity({ name: 'Test' });
            expect(identity.id).toMatch(/^identity--/);
        });

        it('should default TLP to WHITE', () => {
            const identity = new Identity({ name: 'Test' });
            expect(identity.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const identity = new Identity({ name: 'Test' });
            expect(identity.sectors).toEqual([]);
            expect(identity.roles).toEqual([]);
            expect(identity.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const identity = new Identity({
                id: 'identity--identity-id-1',
                name: 'ACME Corp',
                description: 'Technology company',
                identityClass: IdentityClass.ORGANIZATION,
                sectors: ['technology', 'telecommunications'],
                contactInformation: 'info@acme.com',
                roles: ['victim'],
                confidence: 80,
                revoked: false,
                externalReferences: [
                    { sourceName: 'Internal', externalId: 'ID-001' },
                ],
                tlp: TLP.GREEN,
                createdAt: now,
                updatedAt: now,
            });

            expect(identity.id).toBe('identity--identity-id-1');
            expect(identity.name).toBe('ACME Corp');
            expect(identity.identityClass).toBe(IdentityClass.ORGANIZATION);
            expect(identity.sectors).toEqual([
                'technology',
                'telecommunications',
            ]);
            expect(identity.contactInformation).toBe('info@acme.com');
            expect(identity.roles).toEqual(['victim']);
            expect(identity.confidence).toBe(80);
            expect(identity.revoked).toBe(false);
            expect(identity.externalReferences).toEqual([
                { sourceName: 'Internal', externalId: 'ID-001' },
            ]);
            expect(identity.tlp).toBe(TLP.GREEN);
            expect(identity.createdAt).toBe(now);
            expect(identity.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const identity = new Identity({ name: 'Test' });
            expect(identity.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const identity = new Identity({ name: 'Test' });
            expect(identity.revoked).toBe(false);
        });
    });
});
