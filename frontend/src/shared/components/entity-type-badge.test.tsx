import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EntityTypeBadge } from './entity-type-badge';

describe('EntityTypeBadge', () => {
    it.each([
        ['incident', 'INCIDENT'],
        ['threat-actor', 'THREAT ACTOR'],
        ['campaign', 'CAMPAIGN'],
        ['malware', 'MALWARE'],
        ['vulnerability', 'VULNERABILITY'],
        ['report', 'REPORT'],
    ] as const)('renders correct label for entity type "%s"', (type, label) => {
        render(<EntityTypeBadge entityType={type} />);
        expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('accepts an optional className', () => {
        const { container } = render(
            <EntityTypeBadge entityType="malware" className="custom-class" />,
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
