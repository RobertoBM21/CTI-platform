import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';

export interface ObservedDataProps {
    id?: string;
    firstObserved: Date;
    lastObserved: Date;
    numberObserved: number;
    objectRefs?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ObservedData {
    readonly id: string;
    readonly firstObserved: Date;
    readonly lastObserved: Date;
    readonly numberObserved: number;
    readonly objectRefs: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: ObservedDataProps) {
        this.id = props.id ?? `observed-data--${crypto.randomUUID()}`;
        this.firstObserved = props.firstObserved;
        this.lastObserved = props.lastObserved;
        this.numberObserved = props.numberObserved;
        this.objectRefs = props.objectRefs ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
