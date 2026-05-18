import { ExternalReference } from '../../../shared/domain/value-objects/external-reference.vo';
import { TLP } from '../../../shared/domain/value-objects/tlp.vo';
import { ReportType } from '../value-objects/report-type.vo';

export interface ReportProps {
    id?: string;
    name: string;
    description?: string;
    reportTypes?: ReportType[];
    published: Date;
    objectRefs?: string[];
    confidence?: number;
    revoked?: boolean;
    externalReferences?: ExternalReference[];
    tlp?: TLP;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Report {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly reportTypes: ReportType[];
    readonly published: Date;
    readonly objectRefs: string[];
    readonly confidence?: number;
    readonly revoked: boolean;
    readonly externalReferences: ExternalReference[];
    readonly tlp: TLP;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: ReportProps) {
        this.id = props.id ?? `report--${crypto.randomUUID()}`;
        this.name = props.name;
        this.description = props.description;
        this.reportTypes = props.reportTypes ?? [];
        this.published = props.published;
        this.objectRefs = props.objectRefs ?? [];
        this.confidence = props.confidence;
        this.revoked = props.revoked ?? false;
        this.externalReferences = props.externalReferences ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
