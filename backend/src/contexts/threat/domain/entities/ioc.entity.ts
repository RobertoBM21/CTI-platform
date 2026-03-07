import { TLP } from '../value-objects';
import { IocType } from '../value-objects/ioc-type.vo';

export type IocSourceType = 'threat-actor' | 'campaign' | 'incident';

export interface IocProps {
    id?: string;
    type: IocType;
    value: string;
    description?: string;
    tags?: string[];
    tlp?: TLP;
    sourceType: IocSourceType;
    sourceId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Ioc {
    readonly id: string;
    readonly type: IocType;
    readonly value: string;
    readonly description?: string;
    readonly tags: string[];
    readonly tlp: TLP;
    readonly sourceType: IocSourceType;
    readonly sourceId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: IocProps) {
        this.id = props.id ?? crypto.randomUUID();
        this.type = props.type;
        this.value = props.value;
        this.description = props.description;
        this.tags = props.tags ?? [];
        this.tlp = props.tlp ?? TLP.WHITE;
        this.sourceType = props.sourceType;
        this.sourceId = props.sourceId;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
