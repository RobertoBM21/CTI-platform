import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../value-objects';

export interface IncidentProps {
    id?: string;
    name: string;
    description?: string;
    firstSeen?: Date;
    lastSeen?: Date;
    objective?: string;
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Incident {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly objective?: string;
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IncidentProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.objective = props.objective;
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
