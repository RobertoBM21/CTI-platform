import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    AttackPatternService,
    CampaignService,
    IncidentService,
    IocService,
    ThreatActorService,
} from '../application/services';
import {
    AttackPatternRepository,
    CampaignRepository,
    IncidentRepository,
    IocRepository,
    ThreatActorRepository,
} from '../domain';
import { AttackPatternsController } from './controllers/attack-patterns.controller';
import { CampaignsController } from './controllers/campaigns.controller';
import { IncidentsController } from './controllers/incidents.controller';
import { IocsController } from './controllers/iocs.controller';
import { ThreatActorsController } from './controllers/threat-actors.controller';
import {
    AttackPatternMongooseRepository,
    CampaignMongooseRepository,
    IncidentMongooseRepository,
    IocMongooseRepository,
    ThreatActorMongooseRepository,
} from './persistence/repositories';
import {
    AttackPatternDocument,
    AttackPatternSchema,
    CampaignDocument,
    CampaignSchema,
    IncidentDocument,
    IncidentSchema,
    IocDocument,
    IocSchema,
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
            { name: IocDocument.name, schema: IocSchema },
        ]),
    ],
    controllers: [
        ThreatActorsController,
        CampaignsController,
        IncidentsController,
        AttackPatternsController,
        IocsController,
    ],
    providers: [
        ThreatActorMongooseRepository,
        CampaignMongooseRepository,
        IncidentMongooseRepository,
        AttackPatternMongooseRepository,
        IocMongooseRepository,
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
            provide: IocRepository,
            useExisting: IocMongooseRepository,
        },
        ThreatActorService,
        CampaignService,
        IncidentService,
        AttackPatternService,
        IocService,
    ],
    exports: [
        ThreatActorRepository,
        CampaignRepository,
        IncidentRepository,
        AttackPatternRepository,
        IocRepository,
        ThreatActorService,
        CampaignService,
        IncidentService,
        AttackPatternService,
        IocService,
    ],
})
export class ThreatModule {}
