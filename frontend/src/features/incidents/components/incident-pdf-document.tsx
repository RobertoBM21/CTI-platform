import { formatDate, formatVocabLabel, getStixType } from '@/shared/lib/stix';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { IncidentDetail } from '../types';

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
});

interface IncidentPdfDocumentProps {
    detail: IncidentDetail;
}

export function IncidentPdfDocument({ detail }: IncidentPdfDocumentProps) {
    const { entity, relatedObjects, sightings } = detail;

    const byType = (type: string) =>
        relatedObjects.filter(
            ({ object }) => object && getStixType(object.id) === type,
        );

    const threatActors = byType('threat-actor');
    const attackPatterns = byType('attack-pattern');
    const campaigns = byType('campaign');
    const malware = byType('malware');
    const tools = byType('tool');
    const vulnerabilities = byType('vulnerability');
    const indicators = byType('indicator');
    const targets = relatedObjects.filter(
        ({ relationship }) => relationship.relationshipType === 'targets',
    );

    return (
        <Document
            title={entity.name}
            author="CITIUM CTI Platform"
            subject="Intrusion Analysis Report"
        >
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.badge}>
                        CITIUM · INTRUSION ANALYSIS REPORT
                    </Text>
                    <Text style={styles.title}>{entity.name}</Text>
                    <Text style={styles.meta}>
                        TLP: {entity.tlp.toUpperCase()} ·{' '}
                        {entity.confidence != null
                            ? `Confidence: ${entity.confidence}%`
                            : 'Confidence: N/A'}
                        {entity.firstSeen
                            ? ` · From: ${formatDate(entity.firstSeen)}`
                            : ''}
                        {entity.lastSeen
                            ? ` · To: ${formatDate(entity.lastSeen)}`
                            : ''}
                    </Text>
                </View>

                {/* ── Metadata ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Incident Metadata</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Incident ID</Text>
                        <Text style={styles.value}>{entity.id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Created</Text>
                        <Text style={styles.value}>
                            {formatDate(entity.createdAt)}
                        </Text>
                    </View>
                    {entity.firstSeen && (
                        <View style={styles.row}>
                            <Text style={styles.label}>First Seen</Text>
                            <Text style={styles.value}>
                                {formatDate(entity.firstSeen)}
                            </Text>
                        </View>
                    )}
                    {entity.lastSeen && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Last Seen</Text>
                            <Text style={styles.value}>
                                {formatDate(entity.lastSeen)}
                            </Text>
                        </View>
                    )}
                    {entity.objective && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Objective</Text>
                            <Text style={styles.value}>{entity.objective}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>
                            {entity.revoked ? 'Revoked' : 'Active'}
                        </Text>
                    </View>
                </View>

                {/* ── Executive Summary ── */}
                {entity.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Executive Summary
                        </Text>
                        <Text style={styles.bodyText}>
                            {entity.description}
                        </Text>
                    </View>
                )}

                {/* ── Associated Threat Actors ── */}
                {threatActors.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Associated Threat Actors ({threatActors.length})
                        </Text>
                        {threatActors.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── MITRE ATT&CK Techniques ── */}
                {attackPatterns.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            MITRE ATT&CK Techniques ({attackPatterns.length})
                        </Text>
                        {attackPatterns.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Associated Campaigns ── */}
                {campaigns.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Associated Campaigns ({campaigns.length})
                        </Text>
                        {campaigns.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Malware & Tools ── */}
                {(malware.length > 0 || tools.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Malware & Tools ({malware.length + tools.length})
                        </Text>
                        {[...malware, ...tools].map(
                            ({ relationship, object }) => (
                                <View
                                    key={relationship.id}
                                    style={styles.objRow}
                                >
                                    <Text style={styles.objType}>
                                        {getStixType(object?.id ?? '')}
                                    </Text>
                                    <Text style={styles.objName}>
                                        {object?.name ?? object?.id ?? '—'}
                                    </Text>
                                    <Text style={styles.objRel}>
                                        {formatVocabLabel(
                                            relationship.relationshipType,
                                        )}
                                    </Text>
                                </View>
                            ),
                        )}
                    </View>
                )}

                {/* ── Indicators of Compromise ── */}
                {indicators.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Indicators of Compromise ({indicators.length})
                        </Text>
                        {indicators.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ??
                                        String(
                                            object?.['pattern'] ??
                                                object?.id ??
                                                '—',
                                        )}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Vulnerabilities Exploited ── */}
                {vulnerabilities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Vulnerabilities Exploited ({vulnerabilities.length})
                        </Text>
                        {vulnerabilities.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {formatVocabLabel(
                                        relationship.relationshipType,
                                    )}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Targeted Entities ── */}
                {targets.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Targeted Entities ({targets.length})
                        </Text>
                        {targets.map(({ relationship, object }) => (
                            <View key={relationship.id} style={styles.objRow}>
                                <Text style={styles.objType}>
                                    {object
                                        ? formatVocabLabel(
                                              getStixType(object.id),
                                          )
                                        : '—'}
                                </Text>
                                <Text style={styles.objName}>
                                    {object?.name ?? object?.id ?? '—'}
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
                        CITIUM CTI Platform — Intrusion Analysis — TLP:
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
