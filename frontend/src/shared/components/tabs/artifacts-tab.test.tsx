import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtifactsTab } from './artifacts-tab';

const baseDetail = {
    entity: {
        id: 'malware--1',
        name: 'Sample Malware',
        description: null,
        confidence: null,
        createdBy: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
    relatedObjects: [],
    sightings: [],
};

describe('ArtifactsTab', () => {
    it('shows empty state when no indicators are linked', () => {
        render(<ArtifactsTab detail={baseDetail} />);

        expect(
            screen.getByText('No indicators linked to this entity.'),
        ).toBeInTheDocument();
    });

    it('renders indicator metadata and expands pattern content', () => {
        render(
            <ArtifactsTab
                detail={{
                    ...baseDetail,
                    relatedObjects: [
                        {
                            relationship: {
                                id: 'relationship--1',
                                relationshipType: 'indicates',
                                sourceRef: 'indicator--1',
                                targetRef: 'malware--1',
                                tlp: 'clear',
                                createdAt: '2024-01-01T00:00:00Z',
                                updatedAt: '2024-01-01T00:00:00Z',
                            },
                            object: {
                                id: 'indicator--1',
                                name: 'Suspicious Domain IOC',
                                pattern_type: 'stix',
                                pattern:
                                    "[domain-name:value = 'a.test']\nline-2\nline-3\nline-4",
                                valid_from: '2024-01-01T00:00:00Z',
                                valid_until: '2024-12-31T00:00:00Z',
                                createdAt: '2024-01-01T00:00:00Z',
                            },
                        },
                    ],
                }}
            />,
        );

        expect(screen.getByText('Suspicious Domain IOC')).toBeInTheDocument();
        expect(screen.getByText('STIX')).toBeInTheDocument();
        expect(screen.getByText(/VALID FROM/i)).toBeInTheDocument();
        const expandPatternButton = screen.getByText('Show full pattern', {
            selector: 'button',
        });
        fireEvent.click(expandPatternButton);

        const collapsePatternButton = screen.getByText('Show less pattern', {
            selector: 'button',
        });
        expect(collapsePatternButton).toBeInTheDocument();
        expect(screen.getByText(/line-4/)).toBeInTheDocument();
    });
});
