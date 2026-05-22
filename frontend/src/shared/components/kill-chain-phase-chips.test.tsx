import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KillChainPhaseChips } from './kill-chain-phase-chips';

describe('KillChainPhaseChips', () => {
    it('renders nothing when phases array is empty', () => {
        const { container } = render(<KillChainPhaseChips phases={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('groups phases by kill-chain and renders formatted labels', () => {
        render(
            <KillChainPhaseChips
                phases={[
                    {
                        killChainName: 'mitre-attack',
                        phaseName: 'command-and-control',
                    },
                    {
                        killChainName: 'mitre-attack',
                        phaseName: 'exfiltration',
                    },
                    {
                        killChainName: 'mitre-influence',
                        phaseName: 'amplification',
                    },
                ]}
            />,
        );

        expect(screen.getByText('Mitre Attack')).toBeInTheDocument();
        expect(screen.getByText('Mitre Influence')).toBeInTheDocument();
        expect(screen.getByText('Command And Control')).toBeInTheDocument();
        expect(screen.getByText('Exfiltration')).toBeInTheDocument();
        expect(screen.getByText('Amplification')).toBeInTheDocument();
    });
});
