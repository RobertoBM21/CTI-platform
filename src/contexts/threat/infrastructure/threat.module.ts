import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetAttackPatternDetailUseCase } from '../application/use-cases/get-attack-pattern-detail.use-case';
import { GetCampaignDetailUseCase } from '../application/use-cases/get-campaign-detail.use-case';
import { GetIncidentDetailUseCase } from '../application/use-cases/get-incident-detail.use-case';
import { GetThreatActorDetailUseCase } from '../application/use-cases/get-threat-actor-detail.use-case';
import { ListAttackPatternsUseCase } from '../application/use-cases/list-attack-patterns.use-case';
import { ListCampaignsUseCase } from '../application/use-cases/list-campaigns.use-case';
import { ListIncidentsUseCase } from '../application/use-cases/list-incidents.use-case';
import { ListIocsUseCase } from '../application/use-cases/list-iocs.use-case';
import { ListThreatActorsUseCase } from '../application/use-cases/list-threat-actors.use-case';
import {
    AttackPatternRepository,
    CampaignRepository,
    IncidentRepository,
    IocRepository,
    ThreatActorRepository,
} from '../domain';
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
    controllers: [],
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
        ListThreatActorsUseCase,
        GetThreatActorDetailUseCase,
        ListCampaignsUseCase,
        GetCampaignDetailUseCase,
        ListIncidentsUseCase,
        GetIncidentDetailUseCase,
        ListAttackPatternsUseCase,
        GetAttackPatternDetailUseCase,
        ListIocsUseCase,
    ],
    exports: [
        ThreatActorRepository,
        CampaignRepository,
        IncidentRepository,
        AttackPatternRepository,
        IocRepository,
        ListThreatActorsUseCase,
        GetThreatActorDetailUseCase,
        ListCampaignsUseCase,
        GetCampaignDetailUseCase,
        ListIncidentsUseCase,
        GetIncidentDetailUseCase,
        ListAttackPatternsUseCase,
        GetAttackPatternDetailUseCase,
        ListIocsUseCase,
    ],
})
export class ThreatModule {}
