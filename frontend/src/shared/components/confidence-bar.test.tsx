import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfidenceBar } from './confidence-bar';

describe('ConfidenceBar', () => {
    it('renders the confidence percentage as text', () => {
        render(<ConfidenceBar confidence={75} />);
        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('uses emerald fill for confidence >= 80', () => {
        const { container } = render(<ConfidenceBar confidence={85} />);
        const fill = container.querySelector('.bg-emerald-500');
        expect(fill).toBeInTheDocument();
    });

    it('uses amber fill for confidence >= 50 and < 80', () => {
        const { container } = render(<ConfidenceBar confidence={60} />);
        const fill = container.querySelector('.bg-amber-500');
        expect(fill).toBeInTheDocument();
    });

    it('uses zinc fill for confidence < 50', () => {
        const { container } = render(<ConfidenceBar confidence={30} />);
        const fill = container.querySelector('.bg-zinc-400');
        expect(fill).toBeInTheDocument();
    });

    it('sets fill width to the confidence percentage', () => {
        const { container } = render(<ConfidenceBar confidence={42} />);
        const fill = container.querySelector<HTMLElement>('[style]');
        expect(fill?.style.width).toBe('42%');
    });
});
