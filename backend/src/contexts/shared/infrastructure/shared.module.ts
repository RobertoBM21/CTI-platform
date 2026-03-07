import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
} from '../../threat/infrastructure/persistence/schemas';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './health.service';

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
    controllers: [HealthController],
    providers: [HealthService],
})
export class SharedModule {}
