export enum TLP {
    WHITE = 'white',
    CLEAR = 'clear',
    GREEN = 'green',
    AMBER = 'amber',
    AMBER_STRICT = 'amber+strict',
    RED = 'red',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum ThreatCatalogSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    NAME = 'name',
}

export type EntityType =
    | 'incident'
    | 'threat-actor'
    | 'campaign'
    | 'attack-pattern'
    | 'indicator'
    | 'malware'
    | 'tool'
    | 'vulnerability'
    | 'infrastructure'
    | 'intrusion-set'
    | 'identity'
    | 'location'
    | 'course-of-action'
    | 'note'
    | 'opinion'
    | 'malware-analysis'
    | 'observed-data'
    | 'report';
