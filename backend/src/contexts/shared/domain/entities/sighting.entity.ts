import { TLP } from '../value-objects/tlp.vo';

export interface SightingProps {
    id?: string;
    description?: string;
    firstSeen?: Date;
    lastSeen?: Date;
    count?: number;
    sightingOfRef: string;
    observedDataRefs?: string[];
    whereSightedRefs?: string[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Sighting {
    readonly id: string;
    readonly description?: string;
    readonly firstSeen?: Date;
    readonly lastSeen?: Date;
    readonly count: number;
    readonly sightingOfRef: string;
    readonly observedDataRefs: string[];
    readonly whereSightedRefs: string[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: SightingProps) {
        this.id = props.id ?? `sighting--${crypto.randomUUID()}`;
        this.description = props.description;
        this.firstSeen = props.firstSeen;
        this.lastSeen = props.lastSeen;
        this.count = props.count ?? 1;
        this.sightingOfRef = props.sightingOfRef;
        this.observedDataRefs = props.observedDataRefs ?? [];
        this.whereSightedRefs = props.whereSightedRefs ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
