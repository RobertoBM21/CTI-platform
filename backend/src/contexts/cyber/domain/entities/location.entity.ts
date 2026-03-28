import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { Region } from '../value-objects';

export interface LocationProps {
    id?: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    region?: Region;
    administrativeArea?: string;
    city?: string;
    postalCode?: string;
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Location {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly country?: string;
    readonly region?: Region;
    readonly administrativeArea?: string;
    readonly city?: string;
    readonly postalCode?: string;
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: LocationProps) {
        this.id = props.id ?? `location--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.latitude = props.latitude;
        this.longitude = props.longitude;
        this.country = props.country;
        this.region = props.region;
        this.administrativeArea = props.administrativeArea;
        this.city = props.city;
        this.postalCode = props.postalCode;
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
