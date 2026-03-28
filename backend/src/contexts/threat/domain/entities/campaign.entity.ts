import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { AttackMotivation, TLP } from '../value-objects';

export interface CampaignProps {
    id?: string;
    name: string;
    description?: string;
    aliases?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    objective?: string;
    primaryMotivations?: AttackMotivation[];
    secondaryMotivations?: AttackMotivation[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Campaign {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly aliases: string[];
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly objective?: string;
    readonly primaryMotivations: AttackMotivation[];
    readonly secondaryMotivations: AttackMotivation[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: CampaignProps) {
        this.id = props.id ?? `campaign--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.aliases = props.aliases ?? [];
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.objective = props.objective;
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
