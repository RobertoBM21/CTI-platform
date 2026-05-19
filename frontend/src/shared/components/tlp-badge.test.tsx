import { TLP } from '@/shared/types/enums';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TlpBadge } from './tlp-badge';

describe('TlpBadge', () => {
    it.each([
        [TLP.WHITE, 'TLP:WHITE'],
        [TLP.CLEAR, 'TLP:CLEAR'],
        [TLP.GREEN, 'TLP:GREEN'],
        [TLP.AMBER, 'TLP:AMBER'],
        [TLP.AMBER_STRICT, 'TLP:AMBER+STRICT'],
        [TLP.RED, 'TLP:RED'],
    ])('renders correct label for %s', (tlp, expectedLabel) => {
        render(<TlpBadge tlp={tlp} />);
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    });

    it('accepts an optional className', () => {
        const { container } = render(
            <TlpBadge tlp={TLP.GREEN} className="custom-class" />,
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
