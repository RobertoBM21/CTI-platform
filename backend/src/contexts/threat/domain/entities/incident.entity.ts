import { TLP } from '../value-objects';

export interface IncidentProps {
    id?: string;
    name: string;
    description?: string;
    firstSeen?: Date;
    lastSeen?: Date;
    objective?: string;
    tlp?: TLP;
    threatActorIds?: string[];
    campaignId?: string;
    attackPatternIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Incident {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly objective?: string;
    readonly tlp: TLP;
    readonly threatActorIds: string[];
    readonly campaignId?: string;
    readonly attackPatternIds: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IncidentProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.objective = props.objective;
        this.tlp = props.tlp ?? TLP.WHITE;
        this.threatActorIds = props.threatActorIds ?? [];
        this.campaignId = props.campaignId;
        this.attackPatternIds = props.attackPatternIds ?? [];
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
