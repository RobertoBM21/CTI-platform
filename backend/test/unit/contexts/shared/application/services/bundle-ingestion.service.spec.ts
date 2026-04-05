import { BundleIngestionService } from '../../../../../../src/contexts/shared/application/services/bundle-ingestion.service';
import { StixMapper } from '../../../../../../src/contexts/shared/application/services/stix-mapper.service';

describe('BundleIngestionService', () => {
    const mockSave = jest.fn().mockResolvedValue({});

    function buildMockService() {
        return { findById: jest.fn(), save: mockSave };
    }

    let service: BundleIngestionService;
    let mapper: StixMapper;

    beforeEach(() => {
        jest.clearAllMocks();
        mapper = new StixMapper();

        const threatActorService = buildMockService();
        const campaignService = buildMockService();
        const incidentService = buildMockService();
        const attackPatternService = buildMockService();
        const indicatorService = buildMockService();
        const malwareService = buildMockService();
        const toolService = buildMockService();
        const vulnerabilityService = buildMockService();
        const infrastructureEntityService = buildMockService();
        const intrusionSetService = buildMockService();
        const identityService = buildMockService();
        const locationService = buildMockService();
        const courseOfActionService = buildMockService();
        const noteService = buildMockService();
        const opinionService = buildMockService();
        const relationshipService = buildMockService();
        const sightingService = buildMockService();

        service = new BundleIngestionService(
            mapper,
            threatActorService as never,
            campaignService as never,
            incidentService as never,
            attackPatternService as never,
            indicatorService as never,
            malwareService as never,
            toolService as never,
            vulnerabilityService as never,
            infrastructureEntityService as never,
            intrusionSetService as never,
            identityService as never,
            locationService as never,
            courseOfActionService as never,
            noteService as never,
            opinionService as never,
            relationshipService as never,
            sightingService as never,
        ) as unknown as BundleIngestionService;
    });

    it('should process a bundle with multiple object types', async () => {
        const objects = [
            {
                type: 'threat-actor',
                id: 'threat-actor--abc',
                name: 'Test',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
            {
                type: 'identity',
                id: 'identity--abc',
                name: 'Test Org',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
            {
                type: 'relationship',
                id: 'relationship--abc',
                relationship_type: 'attributed-to',
                source_ref: 'threat-actor--abc',
                target_ref: 'identity--abc',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
        ];

        const result = await service.ingest(objects);

        expect(result.total).toBe(3);
        expect(result.processed).toBe(3);
        expect(result.skipped).toBe(0);
        expect(result.failed).toBe(0);
        expect(mockSave).toHaveBeenCalledTimes(3);
    });

    it('should skip unsupported STIX types silently', async () => {
        const objects = [
            {
                type: 'marking-definition',
                id: 'marking-definition--abc',
            },
            {
                type: 'threat-actor',
                id: 'threat-actor--abc',
                name: 'Test',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
        ];

        const result = await service.ingest(objects);

        expect(result.total).toBe(2);
        expect(result.processed).toBe(1);
        expect(result.skipped).toBe(1);
        expect(result.failed).toBe(0);
    });

    it('should handle individual save failures without aborting', async () => {
        mockSave
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('DB error'))
            .mockResolvedValueOnce({});

        const objects = [
            {
                type: 'threat-actor',
                id: 'threat-actor--1',
                name: 'First',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
            {
                type: 'identity',
                id: 'identity--2',
                name: 'Failing',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
            {
                type: 'vulnerability',
                id: 'vulnerability--3',
                name: 'Third',
                created: '2020-01-01T00:00:00.000Z',
                modified: '2020-01-01T00:00:00.000Z',
            },
        ];

        const result = await service.ingest(objects);

        expect(result.total).toBe(3);
        expect(result.processed).toBe(2);
        expect(result.failed).toBe(1);
        expect(result.skipped).toBe(0);
    });

    it('should return zeroes for an empty bundle', async () => {
        const result = await service.ingest([]);
        expect(result).toEqual({
            total: 0,
            processed: 0,
            skipped: 0,
            failed: 0,
        });
    });
});
