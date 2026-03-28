import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';

export interface CourseOfActionProps {
    id?: string;
    name: string;
    description?: string;
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CourseOfAction {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: CourseOfActionProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
