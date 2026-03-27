import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    AttackPatternService,
    CampaignService,
    IncidentService,
    IndicatorService,
    ThreatActorService,
} from '../application/services';
import {
    AttackPatternRepository,
    CampaignRepository,
    IncidentRepository,
    IndicatorRepository,
    ThreatActorRepository,
} from '../domain';
import { AttackPatternsController } from './controllers/attack-patterns.controller';
import { CampaignsController } from './controllers/campaigns.controller';
import { IncidentsController } from './controllers/incidents.controller';
import { IndicatorsController } from './controllers/indicators.controller';
import { ThreatActorsController } from './controllers/threat-actors.controller';
import {
    AttackPatternMongooseRepository,
    CampaignMongooseRepository,
    IncidentMongooseRepository,
    IndicatorMongooseRepository,
    ThreatActorMongooseRepository,
} from './persistence/repositories';
import {
    AttackPatternDocument,
    AttackPatternSchema,
    CampaignDocument,
    CampaignSchema,
    IncidentDocument,
    IncidentSchema,
    IndicatorDocument,
    IndicatorSchema,
    ThreatActorDocument,
    ThreatActorSchema,
} from './persistence/schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ThreatActorDocument.name, schema: ThreatActorSchema },
            { name: CampaignDocument.name, schema: CampaignSchema },
            { name: IncidentDocument.name, schema: IncidentSchema },
            { name: AttackPatternDocument.name, schema: AttackPatternSchema },
            { name: IndicatorDocument.name, schema: IndicatorSchema },
        ]),
    ],
    controllers: [
        ThreatActorsController,
        CampaignsController,
        IncidentsController,
        AttackPatternsController,
        IndicatorsController,
    ],
    providers: [
        ThreatActorMongooseRepository,
        CampaignMongooseRepository,
        IncidentMongooseRepository,
        AttackPatternMongooseRepository,
        IndicatorMongooseRepository,
        {
            provide: ThreatActorRepository,
            useExisting: ThreatActorMongooseRepository,
        },
        {
            provide: CampaignRepository,
            useExisting: CampaignMongooseRepository,
        },
        {
            provide: IncidentRepository,
            useExisting: IncidentMongooseRepository,
        },
        {
            provide: AttackPatternRepository,
            useExisting: AttackPatternMongooseRepository,
        },
        {
            provide: IndicatorRepository,
            useExisting: IndicatorMongooseRepository,
        },
        ThreatActorService,
        CampaignService,
        IncidentService,
        AttackPatternService,
        IndicatorService,
    ],
    exports: [
        ThreatActorRepository,
        CampaignRepository,
        IncidentRepository,
        AttackPatternRepository,
        IndicatorRepository,
        ThreatActorService,
        CampaignService,
        IncidentService,
        AttackPatternService,
        IndicatorService,
    ],
})
export class ThreatModule {}
