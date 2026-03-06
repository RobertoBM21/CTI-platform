import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, ConnectionStates, Model } from 'mongoose';
import {
    AttackPatternDoc,
    AttackPatternDocument,
    CampaignDoc,
    CampaignDocument,
    IncidentDoc,
    IncidentDocument,
    IocDoc,
    IocDocument,
    ThreatActorDoc,
    ThreatActorDocument,
} from '../../threat/infrastructure/persistence/schemas';

export interface HealthStatusResponse {
    status: 'ok' | 'degraded';
    timestamp: string;
    database: {
        status: 'up' | 'down';
    };
    counts: {
        threatActors: number;
        campaigns: number;
        incidents: number;
        attackPatterns: number;
        iocs: number;
    };
    lastIngestion: null;
}

@Injectable()
export class HealthService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(ThreatActorDocument.name)
        private readonly threatActorModel: Model<ThreatActorDoc>,
        @InjectModel(CampaignDocument.name)
        private readonly campaignModel: Model<CampaignDoc>,
        @InjectModel(IncidentDocument.name)
        private readonly incidentModel: Model<IncidentDoc>,
        @InjectModel(AttackPatternDocument.name)
        private readonly attackPatternModel: Model<AttackPatternDoc>,
        @InjectModel(IocDocument.name)
        private readonly iocModel: Model<IocDoc>,
    ) {}

    async check(): Promise<HealthStatusResponse> {
        const isDatabaseUp =
            this.connection.readyState === ConnectionStates.connected;
        const [threatActors, campaigns, incidents, attackPatterns, iocs] =
            await Promise.all([
                this.threatActorModel.countDocuments().exec(),
                this.campaignModel.countDocuments().exec(),
                this.incidentModel.countDocuments().exec(),
                this.attackPatternModel.countDocuments().exec(),
                this.iocModel.countDocuments().exec(),
            ]);

        return {
            status: isDatabaseUp ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            database: {
                status: isDatabaseUp ? 'up' : 'down',
            },
            counts: {
                threatActors,
                campaigns,
                incidents,
                attackPatterns,
                iocs,
            },
            lastIngestion: null,
        };
    }
}
