/** Returns the STIX type prefix from a STIX ID (e.g. "threat-actor" from "threat-actor--xxx") */
export function getStixType(id: string): string {
    const idx = id.indexOf('--');
    return idx >= 0 ? id.substring(0, idx) : 'unknown';
}

export type StixDomain = 'cyber' | 'info';

interface StixTypeConfig {
    label: string;
    abbr: string;
    color: string;
    domain: StixDomain;
}

const STIX_CONFIG: Record<string, StixTypeConfig> = {
    incident: {
        label: 'Incident',
        abbr: 'INC',
        color: '#CF4931',
        domain: 'info',
    },
    'threat-actor': {
        label: 'Threat Actor',
        abbr: 'TA',
        color: '#7c3aed',
        domain: 'info',
    },
    campaign: {
        label: 'Campaign',
        abbr: 'C',
        color: '#0284c7',
        domain: 'info',
    },
    'attack-pattern': {
        label: 'Attack Pattern',
        abbr: 'AP',
        color: '#dc2626',
        domain: 'cyber',
    },
    malware: {
        label: 'Malware',
        abbr: 'MW',
        color: '#9333ea',
        domain: 'cyber',
    },
    tool: { label: 'Tool', abbr: 'TL', color: '#16a34a', domain: 'cyber' },
    vulnerability: {
        label: 'Vulnerability',
        abbr: 'VU',
        color: '#ea580c',
        domain: 'cyber',
    },
    indicator: {
        label: 'Indicator',
        abbr: 'IO',
        color: '#d97706',
        domain: 'cyber',
    },
    infrastructure: {
        label: 'Infrastructure',
        abbr: 'IF',
        color: '#0891b2',
        domain: 'cyber',
    },
    'intrusion-set': {
        label: 'Intrusion Set',
        abbr: 'IS',
        color: '#4f46e5',
        domain: 'cyber',
    },
    identity: {
        label: 'Identity',
        abbr: 'ID',
        color: '#6b7280',
        domain: 'info',
    },
    location: {
        label: 'Location',
        abbr: 'LO',
        color: '#6b7280',
        domain: 'info',
    },
    'course-of-action': {
        label: 'Course of Action',
        abbr: 'CA',
        color: '#059669',
        domain: 'info',
    },
    note: { label: 'Note', abbr: 'NT', color: '#b45309', domain: 'info' },
    opinion: {
        label: 'Opinion',
        abbr: 'OP',
        color: '#b45309',
        domain: 'info',
    },
    sighting: {
        label: 'Sighting',
        abbr: 'SG',
        color: '#0284c7',
        domain: 'cyber',
    },
    'malware-analysis': {
        label: 'Malware Analysis',
        abbr: 'MA',
        color: '#7c2d12',
        domain: 'cyber',
    },
    'observed-data': {
        label: 'Observed Data',
        abbr: 'OD',
        color: '#0f766e',
        domain: 'cyber',
    },
    report: {
        label: 'Report',
        abbr: 'RP',
        color: '#4f46e5',
        domain: 'info',
    },
};

const FALLBACK: StixTypeConfig = {
    label: 'Unknown',
    abbr: '?',
    color: '#6b7280',
    domain: 'info',
};

export function getStixConfig(typeOrId: string): StixTypeConfig {
    const type = typeOrId.includes('--') ? getStixType(typeOrId) : typeOrId;
    return STIX_CONFIG[type] ?? { ...FALLBACK, label: type };
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-CA'); // YYYY-MM-DD
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

/**
 * Converts a kebab-case vocabulary value to a readable label.
 * e.g. 'nation-state' → 'Nation State', 'trigger' → 'Trigger'
 */
export function formatVocabLabel(value: string): string {
    return value
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
