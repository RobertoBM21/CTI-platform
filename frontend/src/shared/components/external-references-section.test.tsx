import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalReferencesSection } from './external-references-section';

const refs = [
    { sourceName: 'Ref A', url: 'https://a.test' },
    { sourceName: 'Ref B', url: 'https://b.test' },
    { sourceName: 'Ref C', url: 'https://c.test' },
    { sourceName: 'Ref D', url: 'https://d.test' },
];

describe('ExternalReferencesSection', () => {
    it('does not render when empty and showWhenEmpty is false', () => {
        const { container } = render(<ExternalReferencesSection refs={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders empty message when showWhenEmpty is true', () => {
        render(
            <ExternalReferencesSection
                refs={[]}
                showWhenEmpty
                emptyMessage="No refs"
            />,
        );

        expect(screen.getByText('No refs')).toBeInTheDocument();
    });

    it('shows only default visible refs and expands on click', () => {
        render(<ExternalReferencesSection refs={refs} />);

        expect(screen.getByText('Ref A')).toBeInTheDocument();
        expect(screen.getByText('Ref C')).toBeInTheDocument();
        expect(screen.queryByText('Ref D')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /show 1 more/i }));

        expect(screen.getByText('Ref D')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /show fewer references/i }),
        ).toBeInTheDocument();
    });
});
