import { TLP } from '@/shared/types/enums';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnalysisTab } from './analysis-tab';

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

describe('AnalysisTab', () => {
    it('renders empty messages when no reports or notes exist', () => {
        render(<AnalysisTab detail={baseDetail} />);

        expect(
            screen.getByText('No reports reference this entity yet.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('No related notes found for this entity.'),
        ).toBeInTheDocument();
    });

    it('renders reports sorted by published date and note preview', () => {
        render(
            <AnalysisTab
                detail={{
                    ...baseDetail,
                    relatedReports: [
                        {
                            id: 'report--old',
                            name: 'Older Report',
                            published: '2024-01-05T00:00:00Z',
                            tlp: TLP.CLEAR,
                        },
                        {
                            id: 'report--new',
                            name: 'Newer Report',
                            published: '2024-02-05T00:00:00Z',
                            tlp: TLP.AMBER,
                        },
                    ],
                    relatedObjects: [
                        {
                            relationship: {
                                id: 'relationship--1',
                                relationshipType: 'related-to',
                                sourceRef: 'malware--1',
                                targetRef: 'note--1',
                                tlp: 'clear',
                                createdAt: '2024-01-01T00:00:00Z',
                                updatedAt: '2024-01-01T00:00:00Z',
                            },
                            object: {
                                id: 'note--1',
                                abstract: 'Analyst Note',
                                content: 'Short note content for analysis.',
                                createdAt: '2024-01-10T00:00:00Z',
                            },
                        },
                    ],
                }}
            />,
        );

        const reports = screen.getAllByText(/Report$/);
        expect(reports[0]).toHaveTextContent('Newer Report');
        expect(reports[1]).toHaveTextContent('Older Report');
        expect(screen.getByText('Analyst Note')).toBeInTheDocument();
        expect(
            screen.getByText('Short note content for analysis.'),
        ).toBeInTheDocument();
    });
});
