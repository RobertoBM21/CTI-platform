import { AttackMotivation } from '../../../shared/domain/value-objects/attack-motivation.vo';
import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { ResourceLevel } from '../../../shared/domain/value-objects/resource-level.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';

export interface IntrusionSetProps {
    id?: string;
    name: string;
    description?: string;
    aliases?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    goals?: string;
    resourceLevel?: ResourceLevel;
    primaryMotivations?: AttackMotivation[];
    secondaryMotivations?: AttackMotivation[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class IntrusionSet {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly aliases: string[];
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly goals?: string;
    readonly resourceLevel?: ResourceLevel;
    readonly primaryMotivations: AttackMotivation[];
    readonly secondaryMotivations: AttackMotivation[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IntrusionSetProps) {
        this.id = props.id ?? `intrusion-set--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.aliases = props.aliases ?? [];
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.goals = props.goals;
        this.resourceLevel = props.resourceLevel;
        this.primaryMotivations = props.primaryMotivations ?? [];
        this.secondaryMotivations = props.secondaryMotivations ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
