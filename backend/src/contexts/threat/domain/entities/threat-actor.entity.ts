import {
    AttackMotivation,
    ResourceLevel,
    ThreatActorRole,
    ThreatActorSophistication,
    ThreatActorType,
    TLP,
} from '../value-objects';

export interface ThreatActorProps {
    id?: string;
    name: string;
    description?: string;
    threatActorTypes?: ThreatActorType[];
    aliases?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    roles?: ThreatActorRole[];
    goals?: string;
    sophistication?: ThreatActorSophistication;
    resourceLevel?: ResourceLevel;
    primaryMotivations?: AttackMotivation[];
    secondaryMotivations?: AttackMotivation[];
    personalMotivations?: string;
    tlp?: TLP;
    attackPatternIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class ThreatActor {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly threatActorTypes: ThreatActorType[];
    readonly aliases: string[];
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly roles: ThreatActorRole[];
    readonly goals?: string;
    readonly sophistication?: ThreatActorSophistication;
    readonly resourceLevel?: ResourceLevel;
    readonly primaryMotivations: AttackMotivation[];
    readonly secondaryMotivations: AttackMotivation[];
    readonly personalMotivations?: string;
    readonly tlp: TLP;
    readonly attackPatternIds: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: ThreatActorProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.threatActorTypes = props.threatActorTypes ?? [];
        this.aliases = props.aliases ?? [];
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.roles = props.roles ?? [];
        this.goals = props.goals;
        this.sophistication = props.sophistication;
        this.resourceLevel = props.resourceLevel;
        this.primaryMotivations = props.primaryMotivations ?? [];
        this.secondaryMotivations = props.secondaryMotivations ?? [];
        this.personalMotivations = props.personalMotivations;
        this.tlp = props.tlp ?? TLP.WHITE;
        this.attackPatternIds = props.attackPatternIds ?? [];
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
