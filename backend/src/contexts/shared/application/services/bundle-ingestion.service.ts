import { Injectable, Logger } from '@nestjs/common';
import { CourseOfActionService } from '../../../cyber/application/services/course-of-action.service';
import { IdentityService } from '../../../cyber/application/services/identity.service';
import { InfrastructureEntityService } from '../../../cyber/application/services/infrastructure-entity.service';
import { IntrusionSetService } from '../../../cyber/application/services/intrusion-set.service';
import { LocationService } from '../../../cyber/application/services/location.service';
import { MalwareService } from '../../../cyber/application/services/malware.service';
import { NoteService } from '../../../cyber/application/services/note.service';
import { OpinionService } from '../../../cyber/application/services/opinion.service';
import { ToolService } from '../../../cyber/application/services/tool.service';
import { VulnerabilityService } from '../../../cyber/application/services/vulnerability.service';
import { AttackPatternService } from '../../../threat/application/services/attack-pattern.service';
import { CampaignService } from '../../../threat/application/services/campaign.service';
import { IncidentService } from '../../../threat/application/services/incident.service';
import { IndicatorService } from '../../../threat/application/services/indicator.service';
import { ThreatActorService } from '../../../threat/application/services/threat-actor.service';
import { type IngestionSummary } from '../dtos/stix-bundle.dto';
import { RelationshipService } from './relationship.service';
import { SightingService } from './sighting.service';
import { StixMapper } from './stix-mapper.service';

@Injectable()
export class BundleIngestionService {
    private readonly logger = new Logger(BundleIngestionService.name);

    private readonly savers: ReadonlyMap<
        string,
        { save(entity: unknown): Promise<unknown> }
    >;

    constructor(
        private readonly stixMapper: StixMapper,
        threatActorService: ThreatActorService,
        campaignService: CampaignService,
        incidentService: IncidentService,
        attackPatternService: AttackPatternService,
        indicatorService: IndicatorService,
        malwareService: MalwareService,
        toolService: ToolService,
        vulnerabilityService: VulnerabilityService,
        infrastructureEntityService: InfrastructureEntityService,
        intrusionSetService: IntrusionSetService,
        identityService: IdentityService,
        locationService: LocationService,
        courseOfActionService: CourseOfActionService,
        noteService: NoteService,
        opinionService: OpinionService,
        relationshipService: RelationshipService,
        sightingService: SightingService,
    ) {
        this.savers = new Map<
            string,
            { save(entity: unknown): Promise<unknown> }
        >([
            ['threat-actor', threatActorService],
            ['campaign', campaignService],
            ['incident', incidentService],
            ['attack-pattern', attackPatternService],
            ['indicator', indicatorService],
            ['malware', malwareService],
            ['tool', toolService],
            ['vulnerability', vulnerabilityService],
            ['infrastructure', infrastructureEntityService],
            ['intrusion-set', intrusionSetService],
            ['identity', identityService],
            ['location', locationService],
            ['course-of-action', courseOfActionService],
            ['note', noteService],
            ['opinion', opinionService],
            ['relationship', relationshipService],
            ['sighting', sightingService],
        ]);
    }

    async ingest(
        objects: Record<string, unknown>[],
    ): Promise<IngestionSummary> {
        const summary: IngestionSummary = {
            total: objects.length,
            processed: 0,
            skipped: 0,
            failed: 0,
        };

        for (const obj of objects) {
            const mapped = this.stixMapper.map(obj);

            if (!mapped) {
                summary.skipped++;
                continue;
            }

            const saver = this.savers.get(mapped.type);
            if (!saver) {
                summary.skipped++;
                continue;
            }

            try {
                await saver.save(mapped.entity);
                summary.processed++;
            } catch (error) {
                summary.failed++;
                this.logger.warn(
                    `Failed to ingest ${mapped.type} ${String((obj as { id?: string }).id)}: ${String(error)}`,
                );
            }
        }

        return summary;
    }
}
