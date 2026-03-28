import {
    CourseOfActionService,
    IdentityService,
    InfrastructureEntityService,
    IntrusionSetService,
    LocationService,
    MalwareService,
    NoteService,
    OpinionService,
    ToolService,
    VulnerabilityService,
} from '../../../../../../src/contexts/cyber/application/services';
import {
    RelationshipService,
    SightingService,
} from '../../../../../../src/contexts/shared/application/services';
import {
    AttackPatternService,
    CampaignService,
    IncidentService,
    IndicatorService,
    StixRefResolver,
    ThreatActorService,
} from '../../../../../../src/contexts/threat/application/services';

interface Svc {
    findById(id: string): Promise<unknown>;
}

describe('StixRefResolver', () => {
    function createMockService(entity: unknown = null): Svc {
        return { findById: jest.fn().mockResolvedValue(entity) };
    }

    function buildResolver(overrides: Partial<Record<string, Svc>> = {}) {
        const defaults: Record<string, Svc> = {
            threatActorService: createMockService(),
            campaignService: createMockService(),
            incidentService: createMockService(),
            attackPatternService: createMockService(),
            indicatorService: createMockService(),
            malwareService: createMockService(),
            toolService: createMockService(),
            vulnerabilityService: createMockService(),
            infrastructureEntityService: createMockService(),
            intrusionSetService: createMockService(),
            identityService: createMockService(),
            locationService: createMockService(),
            courseOfActionService: createMockService(),
            noteService: createMockService(),
            opinionService: createMockService(),
            relationshipService: createMockService(),
            sightingService: createMockService(),
        };
        const s = { ...defaults, ...overrides };

        return new StixRefResolver(
            s.threatActorService as ThreatActorService,
            s.campaignService as CampaignService,
            s.incidentService as IncidentService,
            s.attackPatternService as AttackPatternService,
            s.indicatorService as IndicatorService,
            s.malwareService as MalwareService,
            s.toolService as ToolService,
            s.vulnerabilityService as VulnerabilityService,
            s.infrastructureEntityService as InfrastructureEntityService,
            s.intrusionSetService as IntrusionSetService,
            s.identityService as IdentityService,
            s.locationService as LocationService,
            s.courseOfActionService as CourseOfActionService,
            s.noteService as NoteService,
            s.opinionService as OpinionService,
            s.relationshipService as RelationshipService,
            s.sightingService as SightingService,
        );
    }

    it('should resolve a threat-actor STIX ID', async () => {
        const entity = { id: 'threat-actor--ta1', name: 'APT28' };
        const resolver = buildResolver({
            threatActorService: createMockService(entity),
        });

        const result = await resolver.resolve('threat-actor--ta1');

        expect(result).toEqual(entity);
    });

    it('should resolve a malware STIX ID', async () => {
        const entity = { id: 'malware--m1', name: 'Emotet' };
        const resolver = buildResolver({
            malwareService: createMockService(entity),
        });

        const result = await resolver.resolve('malware--m1');

        expect(result).toEqual(entity);
    });

    it('should resolve an infrastructure STIX ID', async () => {
        const entity = { id: 'infrastructure--i1', name: 'C2 Server' };
        const resolver = buildResolver({
            infrastructureEntityService: createMockService(entity),
        });

        const result = await resolver.resolve('infrastructure--i1');

        expect(result).toEqual(entity);
    });

    it('should return null for unknown STIX prefix', async () => {
        const resolver = buildResolver();
        const result = await resolver.resolve('unknown-type--abc');

        expect(result).toBeNull();
    });

    it('should return null for invalid STIX ID format', async () => {
        const resolver = buildResolver();
        const result = await resolver.resolve('not-a-stix-id');

        expect(result).toBeNull();
    });
});
