import { formatDate, formatVocabLabel, getStixType } from '@/shared/lib/stix';
import {
    Document,
    Font,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import type { ReportDetail } from '../types';

Font.register({
    family: 'Geist',
    src: 'https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMEwcGFWNOITd.ttf',
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        padding: 40,
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 24,
        borderBottomWidth: 2,
        borderBottomColor: '#CF4931',
        paddingBottom: 12,
    },
    badge: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#CF4931',
        letterSpacing: 1,
        marginBottom: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#092028',
        marginBottom: 4,
    },
    meta: {
        fontSize: 9,
        color: '#6b7280',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#092028',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 3,
    },
    bodyText: {
        fontSize: 10,
        lineHeight: 1.6,
        color: '#374151',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#6b7280',
        width: 120,
    },
    value: {
        fontSize: 9,
        color: '#1f2937',
        flex: 1,
    },
    refItem: {
        marginBottom: 8,
        paddingLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#CF4931',
    },
    refTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#092028',
    },
    refUrl: {
        fontSize: 8,
        color: '#4f46e5',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 6,
    },
    footerText: {
        fontSize: 8,
        color: '#9ca3af',
    },
    objRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    objType: {
        fontSize: 8,
        color: '#6b7280',
        width: 100,
    },
    objName: {
        fontSize: 9,
        color: '#1f2937',
        flex: 1,
    },
    objRel: {
        fontSize: 8,
        color: '#9ca3af',
        width: 80,
        textAlign: 'right',
    },
});

// STIX types grouped by domain for report rendering
const THREAT_DOMAIN_TYPES = new Set([
    'threat-actor',
    'campaign',
    'incident',
    'intrusion-set',
]);
const CYBER_DOMAIN_TYPES = new Set([
    'attack-pattern',
    'malware',
    'tool',
    'vulnerability',
    'infrastructure',
    'malware-analysis',
    'observed-data',
]);
const INDICATOR_TYPES = new Set(['indicator']);

interface ReportPdfDocumentProps {
    detail: ReportDetail;
}

export function ReportPdfDocument({ detail }: ReportPdfDocumentProps) {
    const { entity, relatedObjects, sightings } = detail;
    const publishedDate = formatDate(entity.published);
    const createdDate = formatDate(entity.createdAt);

    // Group objectRefs by category
    const threatRefs = entity.objectRefs.filter((o) =>
        THREAT_DOMAIN_TYPES.has(getStixType(o.id)),
    );
    const cyberRefs = entity.objectRefs.filter((o) =>
        CYBER_DOMAIN_TYPES.has(getStixType(o.id)),
    );
    const indicatorRefs = entity.objectRefs.filter((o) =>
        INDICATOR_TYPES.has(getStixType(o.id)),
    );
    const otherRefs = entity.objectRefs.filter(
        (o) =>
            !THREAT_DOMAIN_TYPES.has(getStixType(o.id)) &&
            !CYBER_DOMAIN_TYPES.has(getStixType(o.id)) &&
            !INDICATOR_TYPES.has(getStixType(o.id)),
    );

    return (
        <Document
            title={entity.name}
            author="CITIUM CTI Platform"
            subject="Threat Intelligence Report"
        >
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.badge}>
                        CITIUM · THREAT INTELLIGENCE REPORT
                        {entity.reportTypes.length > 0
                            ? ` · ${entity.reportTypes
                                  .map((t) => formatVocabLabel(t))
                                  .join(', ')
                                  .toUpperCase()}`
                            : ''}
                    </Text>
                    <Text style={styles.title}>{entity.name}</Text>
                    <Text style={styles.meta}>
                        Published: {publishedDate} · TLP:{' '}
                        {entity.tlp.toUpperCase()} ·{' '}
                        {entity.confidence != null
                            ? `Confidence: ${entity.confidence}%`
                            : 'Confidence: N/A'}
                    </Text>
                </View>

                {/* ── Metadata ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Report Metadata</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Report ID</Text>
                        <Text style={styles.value}>{entity.id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Published</Text>
                        <Text style={styles.value}>{publishedDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Created</Text>
                        <Text style={styles.value}>{createdDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Report Types</Text>
                        <Text style={styles.value}>
                            {entity.reportTypes.length > 0
                                ? entity.reportTypes
                                      .map(formatVocabLabel)
                                      .join(', ')
                                : 'N/A'}
                        </Text>
                    </View>
                    {entity.createdBy && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Created By</Text>
                            <Text style={styles.value}>{entity.createdBy}</Text>
                        </View>
                    )}
                    {entity.source && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Source</Text>
                            <Text style={styles.value}>{entity.source}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>
                            {entity.revoked ? 'Revoked' : 'Active'}
                        </Text>
                    </View>
                </View>

                {/* ── Analysis / Description ── */}
                {entity.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Analysis</Text>
                        <Text style={styles.bodyText}>
                            {entity.description}
                        </Text>
                    </View>
                )}

                {/* ── Threat Domain Objects ── */}
                {threatRefs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Threat Intelligence ({threatRefs.length})
                        </Text>
                        {threatRefs.map((obj) => (
                            <View key={obj.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(getStixType(obj.id))}
                                </Text>
                                <Text style={styles.objName}>
                                    {obj.name ?? obj.id}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Cyber Domain Objects ── */}
                {cyberRefs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Cyber Intelligence ({cyberRefs.length})
                        </Text>
                        {cyberRefs.map((obj) => (
                            <View key={obj.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(getStixType(obj.id))}
                                </Text>
                                <Text style={styles.objName}>
                                    {obj.name ?? obj.id}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Indicators ── */}
                {indicatorRefs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Indicators of Compromise ({indicatorRefs.length})
                        </Text>
                        {indicatorRefs.map((obj) => (
                            <View key={obj.id} style={styles.objRow}>
                                <Text style={styles.objType}>indicator</Text>
                                <Text style={styles.objName}>
                                    {obj.name ??
                                        String(obj['pattern'] ?? obj.id)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Other Referenced Objects ── */}
                {otherRefs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Other References ({otherRefs.length})
                        </Text>
                        {otherRefs.map((obj) => (
                            <View key={obj.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(getStixType(obj.id))}
                                </Text>
                                <Text style={styles.objName}>
                                    {obj.name ?? obj.id}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Related Intelligence (SROs) ── */}
                {relatedObjects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Related Intelligence ({relatedObjects.length})
                        </Text>
                        {relatedObjects.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
                                </Text>
                                <Text style={styles.objRel}>
                                    {object
                                        ? formatVocabLabel(
                                              getStixType(object.id),
                                          )
                                        : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Sightings ── */}
                {sightings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Sightings ({sightings.length})
                        </Text>
                        {sightings.map((s) => (
                            <View key={s.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {s.firstSeen
                                        ? formatDate(s.firstSeen)
                                        : '—'}
                                </Text>
                                <Text style={styles.objName}>
                                    ×{s.count} occurrence
                                    {s.count !== 1 ? 's' : ''}
                                    {s.description ? ` — ${s.description}` : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── External References ── */}
                {entity.externalReferences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            External References
                        </Text>
                        {entity.externalReferences.map((ref, idx) => (
                            <View key={idx} style={styles.refItem}>
                                <Text style={styles.refTitle}>
                                    {ref.sourceName}
                                    {ref.externalId
                                        ? ` · ${ref.externalId}`
                                        : ''}
                                </Text>
                                {ref.url && (
                                    <Text style={styles.refUrl}>{ref.url}</Text>
                                )}
                                {ref.description && (
                                    <Text style={styles.bodyText}>
                                        {ref.description}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Footer ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        CITIUM CTI Platform — Threat Intelligence Report — TLP:
                        {entity.tlp.toUpperCase()}
                    </Text>
                    <Text
                        style={styles.footerText}
                        render={({ pageNumber, totalPages }) =>
                            `Page ${pageNumber} of ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
}
