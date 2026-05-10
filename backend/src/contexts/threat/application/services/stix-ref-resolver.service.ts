import { Injectable } from '@nestjs/common';
import {
    CourseOfActionService,
    IdentityService,
    InfrastructureEntityService,
    IntrusionSetService,
    LocationService,
    MalwareAnalysisService,
    MalwareService,
    NoteService,
    ObservedDataService,
    OpinionService,
    ToolService,
    VulnerabilityService,
} from '../../../cyber/application/services';
import {
    RelationshipService,
    SightingService,
} from '../../../shared/application/services';
import { AttackPatternService } from './attack-pattern.service';
import { CampaignService } from './campaign.service';
import { IncidentService } from './incident.service';
import { IndicatorService } from './indicator.service';
import { ThreatActorService } from './threat-actor.service';

@Injectable()
export class StixRefResolver {
    private readonly resolvers: ReadonlyMap<
        string,
        { findById(id: string): Promise<unknown> }
    >;

    constructor(
        private readonly threatActorService: ThreatActorService,
        private readonly campaignService: CampaignService,
        private readonly incidentService: IncidentService,
        private readonly attackPatternService: AttackPatternService,
        private readonly indicatorService: IndicatorService,
        private readonly malwareService: MalwareService,
        private readonly toolService: ToolService,
        private readonly vulnerabilityService: VulnerabilityService,
        private readonly infrastructureEntityService: InfrastructureEntityService,
        private readonly intrusionSetService: IntrusionSetService,
        private readonly identityService: IdentityService,
        private readonly locationService: LocationService,
        private readonly courseOfActionService: CourseOfActionService,
        private readonly noteService: NoteService,
        private readonly opinionService: OpinionService,
        private readonly malwareAnalysisService: MalwareAnalysisService,
        private readonly observedDataService: ObservedDataService,
        private readonly relationshipService: RelationshipService,
        private readonly sightingService: SightingService,
    ) {
        this.resolvers = new Map<
            string,
            { findById(id: string): Promise<unknown> }
        >([
            ['threat-actor', this.threatActorService],
            ['campaign', this.campaignService],
            ['incident', this.incidentService],
            ['attack-pattern', this.attackPatternService],
            ['indicator', this.indicatorService],
            ['malware', this.malwareService],
            ['tool', this.toolService],
            ['vulnerability', this.vulnerabilityService],
            ['infrastructure', this.infrastructureEntityService],
            ['intrusion-set', this.intrusionSetService],
            ['identity', this.identityService],
            ['location', this.locationService],
            ['course-of-action', this.courseOfActionService],
            ['note', this.noteService],
            ['opinion', this.opinionService],
            ['malware-analysis', this.malwareAnalysisService],
            ['observed-data', this.observedDataService],
            ['relationship', this.relationshipService],
            ['sighting', this.sightingService],
        ]);
    }

    async resolve(stixId: string): Promise<unknown> {
        const separatorIndex = stixId.indexOf('--');
        if (separatorIndex === -1) return null;

        const prefix = stixId.substring(0, separatorIndex);
        const resolver = this.resolvers.get(prefix);
        if (!resolver) return null;

        return resolver.findById(stixId);
    }
}
