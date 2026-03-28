import { RelationshipType } from '../value-objects/relationship-type.vo';
import { TLP } from '../value-objects/tlp.vo';

export interface RelationshipProps {
    id?: string;
    relationshipType: RelationshipType;
    description?: string;
    sourceRef: string;
    targetRef: string;
    startTime?: Date;
    stopTime?: Date;
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Relationship {
    readonly id: string;
    readonly relationshipType: RelationshipType;
    readonly description?: string;
    readonly sourceRef: string;
    readonly targetRef: string;
    readonly startTime?: Date;
    readonly stopTime?: Date;
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: RelationshipProps) {
        this.id = props.id ?? `relationship--${crypto.randomUUID()}`;
        this.relationshipType = props.relationshipType;
        this.description = props.description;
        this.sourceRef = props.sourceRef;
        this.targetRef = props.targetRef;
        this.startTime = props.startTime;
        this.stopTime = props.stopTime;
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
