import { formatDate, getStixType } from '@/shared/lib/stix';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { IntrusionSetDetail } from '../types';

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

interface IntrusionSetPdfDocumentProps {
    detail: IntrusionSetDetail;
}

export function IntrusionSetPdfDocument({
    detail,
}: IntrusionSetPdfDocumentProps) {
    const { entity, relatedObjects, sightings, relatedReports = [] } = detail;
    const now = new Date().toISOString();

    return (
        <Document
            title={entity.name}
            author="CITIUM CTI Platform"
            subject="Intrusion Set Report"
        >
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.badge}>
                        CITIUM · INTRUSION SET REPORT
                    </Text>
                    <Text style={styles.title}>{entity.name}</Text>
                    <Text style={styles.meta}>
                        TLP: {entity.tlp.toUpperCase()} ·{' '}
                        {entity.confidence != null
                            ? `Confidence: ${entity.confidence}%`
                            : 'Confidence: N/A'}{' '}
                        · Generated: {formatDate(now)}
                    </Text>
                </View>

                {/* ── Intel Profile ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Intel Profile</Text>
                    {entity.resourceLevel && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Resource Level:</Text>
                            <Text style={styles.value}>
                                {entity.resourceLevel}
                            </Text>
                        </View>
                    )}
                    {entity.primaryMotivations.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Primary Motivations:
                            </Text>
                            <Text style={styles.value}>
                                {entity.primaryMotivations.join(', ')}
                            </Text>
                        </View>
                    )}
                    {entity.secondaryMotivations.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>
                                Secondary Motivations:
                            </Text>
                            <Text style={styles.value}>
                                {entity.secondaryMotivations.join(', ')}
                            </Text>
                        </View>
                    )}
                    {entity.goals && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Goals:</Text>
                            <Text style={styles.value}>{entity.goals}</Text>
                        </View>
                    )}
                    {entity.aliases.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Aliases:</Text>
                            <Text style={styles.value}>
                                {entity.aliases.join(', ')}
                            </Text>
                        </View>
                    )}
                    {entity.firstSeen && (
                        <View style={styles.row}>
                            <Text style={styles.label}>First Seen:</Text>
                            <Text style={styles.value}>
                                {formatDate(entity.firstSeen)}
                            </Text>
                        </View>
                    )}
                    {entity.lastSeen && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Last Seen:</Text>
                            <Text style={styles.value}>
                                {formatDate(entity.lastSeen)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Description ── */}
                {entity.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.bodyText}>
                            {entity.description}
                        </Text>
                    </View>
                )}

                {/* ── Related Objects ── */}
                {relatedObjects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Related Objects ({relatedObjects.length})
                        </Text>
                        {relatedObjects.slice(0, 20).map(
                            ({ relationship, object }, i) =>
                                object && (
                                    <View key={i} style={styles.objRow}>
                                        <Text style={styles.objType}>
                                            {getStixType(object.id)}
                                        </Text>
                                        <Text style={styles.objName}>
                                            {object.name ?? object.id}
                                        </Text>
                                        <Text style={styles.objRel}>
                                            {relationship.relationshipType}
                                        </Text>
                                    </View>
                                ),
                        )}
                    </View>
                )}

                {/* ── Related Reports ── */}
                {relatedReports.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Related Reports ({relatedReports.length})
                        </Text>
                        {relatedReports.map((report) => (
                            <View key={report.id} style={styles.objRow}>
                                <Text style={styles.objType}>report</Text>
                                <Text style={styles.objName}>
                                    {report.name}
                                </Text>
                                <Text style={styles.objRel}>
                                    {formatDate(report.published)}
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
                        {sightings.slice(0, 10).map((s, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={styles.label}>Count:</Text>
                                <Text style={styles.value}>{s.count}</Text>
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
                        {entity.externalReferences.map((ref, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={styles.label}>
                                    {ref.sourceName}
                                    {ref.externalId
                                        ? ` · ${ref.externalId}`
                                        : ''}
                                </Text>
                                <Text style={styles.value}>
                                    {ref.url ?? ref.description ?? '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Footer ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        CITIUM CTI Platform — CONFIDENTIAL
                    </Text>
                    <Text style={styles.footerText}>
                        TLP:{entity.tlp.toUpperCase()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
