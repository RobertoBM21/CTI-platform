import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { KillChainPhase } from '../../../shared/domain/value-objects/kill-chain-phase.vo';
import { TLP } from '../value-objects';
import { IndicatorType } from '../value-objects/indicator-type.vo';
import { IocType } from '../value-objects/ioc-type.vo';
import { PatternType } from '../value-objects/pattern-type.vo';

export interface IndicatorProps {
    id?: string;
    name?: string;
    type: IocType;
    value: string;
    description?: string;
    indicatorTypes?: IndicatorType[];
    pattern?: string;
    patternType?: PatternType;
    patternVersion?: string;
    validFrom?: Date;
    validUntil?: Date;
    killChainPhases?: KillChainPhase[];
    tags?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Indicator {
    readonly id: string;
    readonly name?: string;
    readonly type: IocType;
    readonly value: string;
    readonly description?: string;
    readonly indicatorTypes: IndicatorType[];
    readonly pattern?: string;
    readonly patternType?: PatternType;
    readonly patternVersion?: string;
    readonly validFrom?: Date;
    readonly validUntil?: Date;
    readonly killChainPhases: KillChainPhase[];
    readonly tags: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IndicatorProps) {
        this.id = props.id ?? `indicator--${crypto.randomUUID()}`;
        this.name = props.name;
        this.type = props.type;
        this.value = props.value;
        this.description = props.description;
        this.indicatorTypes = props.indicatorTypes ?? [];
        this.pattern = props.pattern;
        this.patternType = props.patternType;
        this.patternVersion = props.patternVersion;
        this.validFrom = props.validFrom;
        this.validUntil = props.validUntil;
        this.killChainPhases = props.killChainPhases ?? [];
        this.tags = props.tags ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
