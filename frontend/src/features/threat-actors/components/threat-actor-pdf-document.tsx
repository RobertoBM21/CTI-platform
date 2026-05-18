import { formatDate, formatVocabLabel, getStixType } from '@/shared/lib/stix';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ThreatActorDetail } from '../types';

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

interface ThreatActorPdfDocumentProps {
    detail: ThreatActorDetail;
}

export function ThreatActorPdfDocument({
    detail,
}: ThreatActorPdfDocumentProps) {
    const { entity, relatedObjects, sightings } = detail;

    const byType = (type: string) =>
        relatedObjects.filter(
            ({ object }) => object && getStixType(object.id) === type,
        );

    const campaigns = byType('campaign');
    const intrusionSets = byType('intrusion-set');
    const attackPatterns = byType('attack-pattern');
    const malware = byType('malware');
    const tools = byType('tool');
    const vulnerabilities = byType('vulnerability');
    const indicators = byType('indicator');
    // Targets: objects linked via a "targets" relationship
    const targets = relatedObjects.filter(
        ({ relationship }) => relationship.relationshipType === 'targets',
    );
    // Locations and identities that aren't already in targets
    const locations = byType('location').filter(
        ({ relationship }) => relationship.relationshipType !== 'targets',
    );
    const identities = byType('identity').filter(
        ({ relationship }) => relationship.relationshipType !== 'targets',
    );

    return (
        <Document
            title={entity.name}
            author="CITIUM CTI Platform"
            subject="Threat Actor Profile"
        >
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.badge}>
                        CITIUM · THREAT ACTOR PROFILE
                    </Text>
                    <Text style={styles.title}>{entity.name}</Text>
                    <Text style={styles.meta}>
                        TLP: {entity.tlp.toUpperCase()} ·{' '}
                        {entity.confidence != null
                            ? `Confidence: ${entity.confidence}%`
                            : 'Confidence: N/A'}
                        {entity.firstSeen
                            ? ` · Active from: ${formatDate(entity.firstSeen)}`
                            : ''}
                        {entity.lastSeen
                            ? ` to ${formatDate(entity.lastSeen)}`
                            : ''}
                    </Text>
                </View>

                {/* ── Actor Profile ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actor Profile</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Actor ID</Text>
                        <Text style={styles.value}>{entity.id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Created</Text>
                        <Text style={styles.value}>
                            {formatDate(entity.createdAt)}
                        </Text>
                    </View>
                    {entity.threatActorTypes.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Actor Types</Text>
                            <Text style={styles.value}>
                                {entity.threatActorTypes
                                    .map(formatVocabLabel)
                                    .join(', ')}
                            </Text>
                        </View>
                    )}
                    {entity.sophistication && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Sophistication</Text>
                            <Text style={styles.value}>
                                {formatVocabLabel(entity.sophistication)}
                            </Text>
                        </View>
                    )}
                    {entity.resourceLevel && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Resource Level</Text>
                            <Text style={styles.value}>
                                {formatVocabLabel(entity.resourceLevel)}
                            </Text>
                        </View>
                    )}
                    {entity.roles.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Roles</Text>
                            <Text style={styles.value}>
                                {entity.roles.map(formatVocabLabel).join(', ')}
                            </Text>
                        </View>
                    )}
                    {entity.aliases.length > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Aliases</Text>
                            <Text style={styles.value}>
                                {entity.aliases.join(', ')}
                            </Text>
                        </View>
                    )}
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
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>
                            {entity.revoked ? 'Revoked' : 'Active'}
                        </Text>
                    </View>
                </View>

                {/* ── Goals & Motivations ── */}
                {(entity.goals ||
                    entity.primaryMotivations.length > 0 ||
                    entity.secondaryMotivations.length > 0 ||
                    entity.personalMotivations ||
                    targets.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Goals & Motivations
                        </Text>
                        {entity.goals && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Goals</Text>
                                <Text style={styles.value}>{entity.goals}</Text>
                            </View>
                        )}
                        {entity.primaryMotivations.length > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>
                                    Primary Motivations
                                </Text>
                                <Text style={styles.value}>
                                    {entity.primaryMotivations
                                        .map(formatVocabLabel)
                                        .join(', ')}
                                </Text>
                            </View>
                        )}
                        {entity.secondaryMotivations.length > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>
                                    Secondary Motivations
                                </Text>
                                <Text style={styles.value}>
                                    {entity.secondaryMotivations
                                        .map(formatVocabLabel)
                                        .join(', ')}
                                </Text>
                            </View>
                        )}
                        {entity.personalMotivations && (
                            <View style={styles.row}>
                                <Text style={styles.label}>
                                    Personal Motivations
                                </Text>
                                <Text style={styles.value}>
                                    {entity.personalMotivations}
                                </Text>
                            </View>
                        )}
                        {targets.length > 0 && (
                            <>
                                <View
                                    style={[
                                        styles.row,
                                        { marginTop: 6, marginBottom: 2 },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.label,
                                            { fontWeight: 'bold' },
                                        ]}
                                    >
                                        Targets
                                    </Text>
                                </View>
                                {targets.map(({ relationship, object }) => (
                                    <View
                                        key={relationship.id}
                                        style={styles.objRow}
                                    >
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
                            </>
                        )}
                    </View>
                )}

                {/* ── Description ── */}
                {entity.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.bodyText}>
                            {entity.description}
                        </Text>
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

                {/* ── Intrusion Sets ── */}
                {intrusionSets.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Intrusion Sets ({intrusionSets.length})
                        </Text>
                        {intrusionSets.map(({ relationship, object }) => (
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

                {/* ── Attributed Identities & Locations ── */}
                {(identities.length > 0 || locations.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Attributed Identities & Locations (
                            {identities.length + locations.length})
                        </Text>
                        {[...identities, ...locations].map(
                            ({ relationship, object }) => (
                                <View
                                    key={relationship.id}
                                    style={styles.objRow}
                                >
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
                        CITIUM CTI Platform — Threat Actor Profile — TLP:
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
