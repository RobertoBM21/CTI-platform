import { RelationshipType } from '../value-objects/relationship-type.vo';

//? Allowed relationship combinations derived from the project ontology
const ALLOWED: ReadonlyMap<string, ReadonlySet<string> | undefined> = new Map([
    // ── Threat domain — project ontology (GeneralPurposeRelationships.csv) ───

    [
        `threat-actor::${RelationshipType.USES}`,
        new Set([
            'attack-pattern',
            'note',
            'opinion',
            'tool',
            'malware',
            'infrastructure',
        ]),
    ],
    [
        `threat-actor::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],
    [
        `threat-actor::${RelationshipType.ATTRIBUTED_TO}`,
        new Set(['intrusion-set']),
    ],
    [`threat-actor::${RelationshipType.IMPERSONATES}`, new Set(['identity'])],
    [`threat-actor::${RelationshipType.LOCATED_AT}`, new Set(['location'])],

    [`campaign::${RelationshipType.ATTRIBUTED_TO}`, new Set(['threat-actor'])],
    [
        `campaign::${RelationshipType.USES}`,
        new Set([
            'attack-pattern',
            'note',
            'opinion',
            'tool',
            'malware',
            'infrastructure',
        ]),
    ],
    [
        `campaign::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],
    [`campaign::${RelationshipType.ORIGINATES_FROM}`, new Set(['location'])],

    [
        `incident::${RelationshipType.ATTRIBUTED_TO}`,
        new Set(['campaign', 'threat-actor']),
    ],
    [
        `incident::${RelationshipType.USES}`,
        new Set([
            'attack-pattern',
            'note',
            'opinion',
            'tool',
            'malware',
            'infrastructure',
        ]),
    ],
    [
        `incident::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],

    [
        `attack-pattern::${RelationshipType.USES}`,
        new Set(['attack-pattern', 'note', 'opinion']),
    ],
    [
        `attack-pattern::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],

    // ── Cyber domain — STIX 2.1 specification ────────────────────────────────

    [
        `malware::${RelationshipType.USES}`,
        new Set(['attack-pattern', 'tool', 'malware']),
    ],
    [
        `malware::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],
    [`malware::${RelationshipType.VARIANT_OF}`, new Set(['malware'])],
    [`malware::${RelationshipType.DROPS}`, new Set(['malware', 'tool'])],
    [`malware::${RelationshipType.DOWNLOADS}`, new Set(['malware', 'tool'])],
    [`malware::${RelationshipType.EXPLOITS}`, new Set(['vulnerability'])],
    [
        `malware::${RelationshipType.COMMUNICATES_WITH}`,
        new Set(['infrastructure']),
    ],
    [`malware::${RelationshipType.ORIGINATES_FROM}`, new Set(['location'])],
    [
        `malware::${RelationshipType.AUTHORED_BY}`,
        new Set(['threat-actor', 'intrusion-set', 'identity']),
    ],
    [`malware::${RelationshipType.BEACONS_TO}`, new Set(['infrastructure'])],
    [
        `malware::${RelationshipType.EXFILTRATES_TO}`,
        new Set(['infrastructure']),
    ],

    [`tool::${RelationshipType.USES}`, new Set(['attack-pattern'])],
    [
        `tool::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],
    [`tool::${RelationshipType.DELIVERS}`, new Set(['malware'])],
    [`tool::${RelationshipType.DROPS}`, new Set(['malware'])],
    [`tool::${RelationshipType.HOSTS}`, new Set(['malware', 'infrastructure'])],

    [
        `indicator::${RelationshipType.INDICATES}`,
        new Set([
            'malware',
            'threat-actor',
            'campaign',
            'intrusion-set',
            'tool',
            'attack-pattern',
            'vulnerability',
            'infrastructure',
        ]),
    ],
    [`indicator::${RelationshipType.BASED_ON}`, new Set(['observed-data'])],

    [
        `course-of-action::${RelationshipType.MITIGATES}`,
        new Set([
            'malware',
            'attack-pattern',
            'tool',
            'vulnerability',
            'indicator',
        ]),
    ],
    [
        `course-of-action::${RelationshipType.REMEDIATES}`,
        new Set(['vulnerability', 'malware']),
    ],
    [
        `course-of-action::${RelationshipType.INVESTIGATES}`,
        new Set([
            'vulnerability',
            'malware',
            'threat-actor',
            'campaign',
            'incident',
        ]),
    ],

    [
        `intrusion-set::${RelationshipType.USES}`,
        new Set(['malware', 'tool', 'attack-pattern', 'infrastructure']),
    ],
    [
        `intrusion-set::${RelationshipType.TARGETS}`,
        new Set(['identity', 'location', 'vulnerability', 'infrastructure']),
    ],
    [
        `intrusion-set::${RelationshipType.ATTRIBUTED_TO}`,
        new Set(['threat-actor']),
    ],
    [
        `intrusion-set::${RelationshipType.ORIGINATES_FROM}`,
        new Set(['location']),
    ],
    [
        `intrusion-set::${RelationshipType.COMPROMISES}`,
        new Set(['infrastructure']),
    ],

    [`identity::${RelationshipType.LOCATED_AT}`, new Set(['location'])],
    [`identity::${RelationshipType.RELATED_TO}`, undefined],
    [`vulnerability::${RelationshipType.RELATED_TO}`, undefined],
]);

export interface RelationshipValidationResult {
    valid: boolean;
    reason?: string;
}

function extractStixType(stixId: string): string | null {
    const idx = stixId.indexOf('--');
    return idx >= 0 ? stixId.substring(0, idx) : null;
}

/**
 * Validates a relationship triple against the project ontology.
 *
 * - `related-to` is always valid (catch-all per STIX 2.1).
 * - If the source type or relationship type is not registered, the validation
 *   is skipped (permissive for future/unregistered types).
 * - `duplicate-of` and `derived-from` are always valid (meta-relationships).
 */
export function validateRelationship(
    sourceRef: string,
    relationshipType: string,
    targetRef: string,
): RelationshipValidationResult {
    const permissiveTypes = new Set([
        RelationshipType.RELATED_TO,
        RelationshipType.DUPLICATE_OF,
        RelationshipType.DERIVED_FROM,
    ] as string[]);

    if (permissiveTypes.has(relationshipType)) {
        return { valid: true };
    }

    const sourceType = extractStixType(sourceRef);
    const targetType = extractStixType(targetRef);

    if (!sourceType || !targetType) {
        return { valid: true };
    }

    const key = `${sourceType}::${relationshipType}`;

    if (!ALLOWED.has(key)) {
        return { valid: true };
    }

    const allowedTargets = ALLOWED.get(key);

    if (allowedTargets === undefined) {
        return { valid: true };
    }

    if (!allowedTargets.has(targetType)) {
        return {
            valid: false,
            reason: `${sourceType} -[${relationshipType}]-> ${targetType} is not defined in the project ontology`,
        };
    }

    return { valid: true };
}
