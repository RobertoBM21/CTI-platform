import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingState } from './loading-state';

describe('LoadingState', () => {
    it('renders the default message', () => {
        render(<LoadingState />);
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('renders a custom message when provided', () => {
        render(<LoadingState message="Fetching data…" />);
        expect(screen.getByText('Fetching data…')).toBeInTheDocument();
    });
});
