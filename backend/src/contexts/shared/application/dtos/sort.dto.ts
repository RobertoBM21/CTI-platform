export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export interface SortCriteria<Field extends string = string> {
    field: Field;
    direction: 1 | -1;
}

export function toSortDirection(order: SortOrder = SortOrder.DESC): 1 | -1 {
    return order === SortOrder.ASC ? 1 : -1;
}
