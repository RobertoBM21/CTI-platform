import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';

export interface NoteProps {
    id?: string;
    content: string;
    abstract?: string;
    objectRefs?: string[];
    authors?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Note {
    readonly id: string;
    readonly content: string;
    readonly abstract?: string;
    readonly objectRefs: string[];
    readonly authors: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: NoteProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.content = props.content;
        this.abstract = props.abstract;
        this.objectRefs = props.objectRefs ?? [];
        this.authors = props.authors ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
