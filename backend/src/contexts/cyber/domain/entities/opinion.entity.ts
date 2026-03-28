import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { OpinionValue } from '../value-objects';

export interface OpinionProps {
    id?: string;
    opinion: OpinionValue;
    objectRefs?: string[];
    explanation?: string;
    authors?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Opinion {
    readonly id: string;
    readonly opinion: OpinionValue;
    readonly objectRefs: string[];
    readonly explanation?: string;
    readonly authors: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: OpinionProps) {
        this.id = props.id ?? `opinion--${crypto.randomUUID()}`;
        this.opinion = props.opinion;
        this.objectRefs = props.objectRefs ?? [];
        this.explanation = props.explanation;
        this.authors = props.authors ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
