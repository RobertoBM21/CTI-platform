import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { KillChainPhase } from '../../../shared/domain/value-objects/kill-chain-phase.vo';
import { TLP } from '../value-objects';

export interface AttackPatternProps {
    id?: string;
    name: string;
    description?: string;
    aliases?: string[];
    externalReference?: string;
    killChainPhases?: KillChainPhase[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class AttackPattern {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly aliases: string[];
    readonly externalReference?: string;
    readonly killChainPhases: KillChainPhase[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: AttackPatternProps) {
        this.id = props.id ?? `attack-pattern--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.aliases = props.aliases ?? [];
        this.externalReference = props.externalReference;
        this.killChainPhases = props.killChainPhases ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
