import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CvssScoreWidget } from './cvss-score-widget';

describe('CvssScoreWidget', () => {
    it('renders unknown severity when score is missing', () => {
        render(<CvssScoreWidget />);

        expect(screen.getByText('Unknown')).toBeInTheDocument();
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders critical severity with vector and EPSS', () => {
        render(
            <CvssScoreWidget
                score={9.8}
                vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
                epssScore={0.123}
            />,
        );

        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('9.8')).toBeInTheDocument();
        expect(screen.getByText('EPSS 12.3%')).toBeInTheDocument();
        expect(
            screen.getByText('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'),
        ).toBeInTheDocument();
    });
});
