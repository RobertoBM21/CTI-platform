import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { IdentityClass } from '../value-objects';

export interface IdentityProps {
    id?: string;
    name: string;
    description?: string;
    identityClass?: IdentityClass;
    sectors?: string[];
    contactInformation?: string;
    roles?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Identity {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly identityClass?: IdentityClass;
    readonly sectors: string[];
    readonly contactInformation?: string;
    readonly roles: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IdentityProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.name = props.name;
        this.description = props.description;
        this.identityClass = props.identityClass;
        this.sectors = props.sectors ?? [];
        this.contactInformation = props.contactInformation;
        this.roles = props.roles ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
