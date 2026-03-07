import { TLP } from '../value-objects';

export interface AttackPatternProps {
    id?: string;
    name: string;
    description?: string;
    aliases?: string[];
    externalReference?: string;
    killChainPhase?: string;
    tlp?: TLP;
    subPatternIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class AttackPattern {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly aliases: string[];
    readonly externalReference?: string;
    readonly killChainPhase?: string;
    readonly tlp: TLP;
    readonly subPatternIds: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: AttackPatternProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.aliases = props.aliases ?? [];
        this.externalReference = props.externalReference;
        this.killChainPhase = props.killChainPhase;
        this.tlp = props.tlp ?? TLP.WHITE;
        this.subPatternIds = props.subPatternIds ?? [];
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
