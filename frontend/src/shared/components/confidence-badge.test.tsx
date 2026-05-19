import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfidenceBadge } from './confidence-badge';

describe('ConfidenceBadge', () => {
    it('returns null when confidence is null', () => {
        const { container } = render(<ConfidenceBadge confidence={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders "Verified" for confidence >= 80', () => {
        render(<ConfidenceBadge confidence={80} />);
        expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('renders "Verified" for confidence of 100', () => {
        render(<ConfidenceBadge confidence={100} />);
        expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('renders "Pending" for confidence >= 50 and < 80', () => {
        render(<ConfidenceBadge confidence={65} />);
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders "Draft" for confidence < 50', () => {
        render(<ConfidenceBadge confidence={30} />);
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('renders "Draft" for confidence of 0', () => {
        render(<ConfidenceBadge confidence={0} />);
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });
});
