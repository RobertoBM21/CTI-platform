import { StixMapper } from '../../../../../../src/contexts/shared/application/services/stix-mapper.service';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects';

describe('StixMapper', () => {
    let mapper: StixMapper;

    beforeEach(() => {
        mapper = new StixMapper();
    });

    function assertNonNull<T>(val: T): asserts val is NonNullable<T> {
        expect(val).not.toBeNull();
    }

    it('should return null for unsupported types', () => {
        const result = mapper.map({ type: 'marking-definition', id: 'md--1' });
        expect(result).toBeNull();
    });

    it('should map threat-actor with STIX snake_case fields', () => {
        const result = mapper.map({
            type: 'threat-actor',
            id: 'threat-actor--abc',
            created: '2014-11-19T23:39:03.893Z',
            modified: '2014-11-19T23:39:03.893Z',
            name: 'Disco Team',
            description: 'A crime syndicate',
            threat_actor_types: ['crime-syndicate'],
            aliases: ['Equipo del Discoteca'],
            roles: ['agent'],
            goals: 'Steal Credit Card Information',
            sophistication: 'expert',
            resource_level: 'organization',
            primary_motivation: 'personal-gain',
            confidence: 90,
            revoked: false,
        });

        assertNonNull(result);
        expect(result.type).toBe('threat-actor');
        const entity = result.entity as {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            threatActorTypes: string[];
            primaryMotivations: string[];
            sophistication: string;
            resourceLevel: string;
            confidence: number;
        };
        expect(entity.id).toBe('threat-actor--abc');
        expect(entity.name).toBe('Disco Team');
        expect(entity.createdAt).toEqual(new Date('2014-11-19T23:39:03.893Z'));
        expect(entity.updatedAt).toEqual(new Date('2014-11-19T23:39:03.893Z'));
        expect(entity.threatActorTypes).toEqual(['crime-syndicate']);
        expect(entity.primaryMotivations).toEqual(['personal-gain']);
        expect(entity.sophistication).toBe('expert');
        expect(entity.resourceLevel).toBe('organization');
        expect(entity.confidence).toBe(90);
    });

    it('should map identity with identity_class and contact_information', () => {
        const result = mapper.map({
            type: 'identity',
            id: 'identity--abc',
            created: '2016-08-23T18:05:49.307Z',
            modified: '2016-08-23T18:05:49.307Z',
            name: 'Disco Team',
            identity_class: 'organization',
            contact_information: 'disco-team@stealthemail.com',
        });

        assertNonNull(result);
        expect(result.type).toBe('identity');
        const entity = result.entity as {
            id: string;
            name: string;
            identityClass: string;
            contactInformation: string;
        };
        expect(entity.id).toBe('identity--abc');
        expect(entity.identityClass).toBe('organization');
        expect(entity.contactInformation).toBe('disco-team@stealthemail.com');
    });

    it('should map relationship with source_ref and target_ref', () => {
        const result = mapper.map({
            type: 'relationship',
            id: 'relationship--abc',
            created: '2020-02-29T18:01:28.577Z',
            modified: '2020-02-29T18:01:28.577Z',
            relationship_type: 'attributed-to',
            source_ref: 'threat-actor--111',
            target_ref: 'identity--222',
        });

        assertNonNull(result);
        expect(result.type).toBe('relationship');
        const entity = result.entity as {
            id: string;
            relationshipType: string;
            sourceRef: string;
            targetRef: string;
        };
        expect(entity.id).toBe('relationship--abc');
        expect(entity.relationshipType).toBe('attributed-to');
        expect(entity.sourceRef).toBe('threat-actor--111');
        expect(entity.targetRef).toBe('identity--222');
    });

    it('should map campaign', () => {
        const result = mapper.map({
            type: 'campaign',
            id: 'campaign--abc',
            name: 'Test Campaign',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            first_seen: '2020-01-01T00:00:00.000Z',
            objective: 'Disruption',
        });

        assertNonNull(result);
        const entity = result.entity as {
            id: string;
            name: string;
            firstSeen: Date;
            objective: string;
        };
        expect(entity.id).toBe('campaign--abc');
        expect(entity.firstSeen).toEqual(new Date('2020-01-01T00:00:00.000Z'));
        expect(entity.objective).toBe('Disruption');
    });

    it('should map malware with is_family and malware_types', () => {
        const result = mapper.map({
            type: 'malware',
            id: 'malware--abc',
            name: 'TestMalware',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            malware_types: ['ransomware'],
            is_family: true,
        });

        assertNonNull(result);
        const entity = result.entity as {
            isFamily: boolean;
            malwareTypes: string[];
        };
        expect(entity.isFamily).toBe(true);
        expect(entity.malwareTypes).toEqual(['ransomware']);
    });

    it('should map tool with tool_types', () => {
        const result = mapper.map({
            type: 'tool',
            id: 'tool--abc',
            name: 'TestTool',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            tool_types: ['remote-access'],
            tool_version: '1.0',
        });

        assertNonNull(result);
        const entity = result.entity as {
            toolTypes: string[];
            toolVersion: string;
        };
        expect(entity.toolTypes).toEqual(['remote-access']);
        expect(entity.toolVersion).toBe('1.0');
    });

    it('should map vulnerability', () => {
        const result = mapper.map({
            type: 'vulnerability',
            id: 'vulnerability--abc',
            name: 'CVE-2021-1234',
            created: '2021-01-01T00:00:00.000Z',
            modified: '2021-01-01T00:00:00.000Z',
        });

        assertNonNull(result);
        expect((result.entity as { name: string }).name).toBe('CVE-2021-1234');
    });

    it('should map infrastructure with infrastructure_types', () => {
        const result = mapper.map({
            type: 'infrastructure',
            id: 'infrastructure--abc',
            name: 'Botnet C2',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            infrastructure_types: ['botnet'],
        });

        assertNonNull(result);
        const entity = result.entity as { infrastructureTypes: string[] };
        expect(entity.infrastructureTypes).toEqual(['botnet']);
    });

    it('should map intrusion-set', () => {
        const result = mapper.map({
            type: 'intrusion-set',
            id: 'intrusion-set--abc',
            name: 'APT28',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            resource_level: 'government',
            primary_motivation: 'ideology',
        });

        assertNonNull(result);
        const entity = result.entity as {
            resourceLevel: string;
            primaryMotivations: string[];
        };
        expect(entity.resourceLevel).toBe('government');
        expect(entity.primaryMotivations).toEqual(['ideology']);
    });

    it('should map location with geographic fields', () => {
        const result = mapper.map({
            type: 'location',
            id: 'location--abc',
            name: 'Test Location',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            latitude: 40.0,
            longitude: -3.0,
            country: 'ES',
            region: 'europe',
            administrative_area: 'Madrid',
            city: 'Madrid',
            postal_code: '28001',
        });

        assertNonNull(result);
        const entity = result.entity as {
            latitude: number;
            longitude: number;
            country: string;
            region: string;
            administrativeArea: string;
            postalCode: string;
        };
        expect(entity.latitude).toBe(40.0);
        expect(entity.country).toBe('ES');
        expect(entity.administrativeArea).toBe('Madrid');
        expect(entity.postalCode).toBe('28001');
    });

    it('should map course-of-action', () => {
        const result = mapper.map({
            type: 'course-of-action',
            id: 'course-of-action--abc',
            name: 'Patch Systems',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
        });

        assertNonNull(result);
        expect((result.entity as { name: string }).name).toBe('Patch Systems');
    });

    it('should map note with content and object_refs', () => {
        const result = mapper.map({
            type: 'note',
            id: 'note--abc',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            content: 'This is a note',
            abstract: 'Summary',
            object_refs: ['malware--111'],
            authors: ['analyst1'],
        });

        assertNonNull(result);
        const entity = result.entity as {
            content: string;
            abstract: string;
            objectRefs: string[];
            authors: string[];
        };
        expect(entity.content).toBe('This is a note');
        expect(entity.objectRefs).toEqual(['malware--111']);
    });

    it('should map opinion with object_refs', () => {
        const result = mapper.map({
            type: 'opinion',
            id: 'opinion--abc',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            opinion: 'agree',
            object_refs: ['malware--111'],
            explanation: 'Looks correct',
        });

        assertNonNull(result);
        const entity = result.entity as {
            opinion: string;
            objectRefs: string[];
            explanation: string;
        };
        expect(entity.opinion).toBe('agree');
        expect(entity.objectRefs).toEqual(['malware--111']);
    });

    it('should map sighting with sighting_of_ref', () => {
        const result = mapper.map({
            type: 'sighting',
            id: 'sighting--abc',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            sighting_of_ref: 'indicator--111',
            where_sighted_refs: ['identity--222'],
            count: 5,
        });

        assertNonNull(result);
        const entity = result.entity as {
            sightingOfRef: string;
            whereSightedRefs: string[];
            count: number;
        };
        expect(entity.sightingOfRef).toBe('indicator--111');
        expect(entity.whereSightedRefs).toEqual(['identity--222']);
        expect(entity.count).toBe(5);
    });

    it('should map incident', () => {
        const result = mapper.map({
            type: 'incident',
            id: 'incident--abc',
            name: 'Breach',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
        });

        assertNonNull(result);
        expect((result.entity as { name: string }).name).toBe('Breach');
    });

    it('should map attack-pattern', () => {
        const result = mapper.map({
            type: 'attack-pattern',
            id: 'attack-pattern--abc',
            name: 'Spear Phishing',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
        });

        assertNonNull(result);
        expect((result.entity as { name: string }).name).toBe('Spear Phishing');
    });

    it('should map indicator with pattern fields', () => {
        const result = mapper.map({
            type: 'indicator',
            id: 'indicator--abc',
            name: 'Malicious IP',
            created: '2020-01-01T00:00:00.000Z',
            modified: '2020-01-01T00:00:00.000Z',
            indicator_types: ['malicious-activity'],
            pattern: "[ipv4-addr:value = '1.2.3.4']",
            pattern_type: 'stix',
            valid_from: '2020-01-01T00:00:00.000Z',
        });

        assertNonNull(result);
        const entity = result.entity as {
            pattern: string;
            patternType: string;
            indicatorTypes: string[];
            validFrom: Date;
        };
        expect(entity.pattern).toBe("[ipv4-addr:value = '1.2.3.4']");
        expect(entity.patternType).toBe('stix');
        expect(entity.indicatorTypes).toEqual(['malicious-activity']);
    });

    it('should map external_references', () => {
        const result = mapper.map({
            type: 'vulnerability',
            id: 'vulnerability--abc',
            name: 'CVE-2021-1234',
            created: '2021-01-01T00:00:00.000Z',
            modified: '2021-01-01T00:00:00.000Z',
            external_references: [
                {
                    source_name: 'cve',
                    external_id: 'CVE-2021-1234',
                    url: 'https://cve.example.com/CVE-2021-1234',
                },
            ],
        });

        assertNonNull(result);
        const entity = result.entity as {
            externalReferences: {
                sourceName: string;
                externalId: string;
                url: string;
            }[];
        };
        expect(entity.externalReferences).toHaveLength(1);
        expect(entity.externalReferences[0].sourceName).toBe('cve');
        expect(entity.externalReferences[0].externalId).toBe('CVE-2021-1234');
    });

    describe('TLP resolution', () => {
        const stixObject = {
            type: 'vulnerability',
            id: 'vulnerability--abc',
            name: 'CVE-2021-1234',
            created: '2021-01-01T00:00:00.000Z',
            modified: '2021-01-01T00:00:00.000Z',
        };

        it('should resolve TLP from object_marking_refs via markingContext', () => {
            const mdId =
                'marking-definition--f88d31f6-1088-4870-be49-4d8e449f5b8a';
            const markingContext = new Map([[mdId, TLP.AMBER]]);
            const result = mapper.map(
                { ...stixObject, object_marking_refs: [mdId] },
                markingContext,
            );
            assertNonNull(result);
            expect((result.entity as { tlp: TLP }).tlp).toBe(TLP.AMBER);
        });

        it('should resolve TLP.CLEAR from object_marking_refs', () => {
            const mdId =
                'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9';
            const markingContext = new Map([[mdId, TLP.CLEAR]]);
            const result = mapper.map(
                { ...stixObject, object_marking_refs: [mdId] },
                markingContext,
            );
            assertNonNull(result);
            expect((result.entity as { tlp: TLP }).tlp).toBe(TLP.CLEAR);
        });

        it('should return TLP.WHITE (entity default) when no markingContext is provided', () => {
            const result = mapper.map(stixObject);
            assertNonNull(result);
            // Entities default tlp to TLP.WHITE when no marking is resolved
            expect((result.entity as { tlp: TLP | undefined }).tlp).toBe(
                TLP.WHITE,
            );
        });
    });
});
