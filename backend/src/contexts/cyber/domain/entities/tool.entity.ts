import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { KillChainPhase } from '../../../shared/domain/value-objects/kill-chain-phase.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { ToolType } from '../value-objects';

export interface ToolProps {
    id?: string;
    name: string;
    description?: string;
    toolTypes?: ToolType[];
    killChainPhases?: KillChainPhase[];
    toolVersion?: string;
    aliases?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Tool {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly toolTypes: ToolType[];
    readonly killChainPhases: KillChainPhase[];
    readonly toolVersion?: string;
    readonly aliases: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: ToolProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.toolTypes = props.toolTypes ?? [];
        this.killChainPhases = props.killChainPhases ?? [];
        this.toolVersion = props.toolVersion;
        this.aliases = props.aliases ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
