import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { KillChainPhase } from '../../../shared/domain/value-objects/kill-chain-phase.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { InfrastructureType } from '../value-objects';

export interface InfrastructureEntityProps {
    id?: string;
    name: string;
    description?: string;
    infrastructureTypes?: InfrastructureType[];
    killChainPhases?: KillChainPhase[];
    aliases?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class InfrastructureEntity {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly infrastructureTypes: InfrastructureType[];
    readonly killChainPhases: KillChainPhase[];
    readonly aliases: string[];
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: InfrastructureEntityProps) {
        this.id = props.id ?? `infrastructure--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.infrastructureTypes = props.infrastructureTypes ?? [];
        this.killChainPhases = props.killChainPhases ?? [];
        this.aliases = props.aliases ?? [];
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
