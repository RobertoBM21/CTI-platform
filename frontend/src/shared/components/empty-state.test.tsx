import { render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
    it('renders the required title', () => {
        render(<EmptyState title="Nothing here" />);
        expect(
            screen.getByRole('heading', { name: 'Nothing here' }),
        ).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
        render(<EmptyState title="Empty" description="Try again later." />);
        expect(screen.getByText('Try again later.')).toBeInTheDocument();
    });

    it('does not render description when omitted', () => {
        render(<EmptyState title="Empty" />);
        expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('renders children in the action slot', () => {
        render(
            <EmptyState title="Empty">
                <button>Retry</button>
            </EmptyState>,
        );
        expect(
            screen.getByRole('button', { name: 'Retry' }),
        ).toBeInTheDocument();
    });

    it('renders the icon when provided', () => {
        render(<EmptyState title="Empty" icon={Search} />);
        // Icon is rendered as SVG inside the icon wrapper
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThan(0);
    });
});
