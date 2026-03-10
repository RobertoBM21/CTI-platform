import Home from '@/app/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Home page', () => {
    it('renders the heading', () => {
        render(<Home />);
        expect(
            screen.getByRole('heading', { name: /cti platform/i }),
        ).toBeInTheDocument();
    });

    it('renders the description', () => {
        render(<Home />);
        expect(
            screen.getByText(/cyber threat intelligence/i),
        ).toBeInTheDocument();
    });

    it('renders shadcn/ui buttons', () => {
        render(<Home />);
        expect(
            screen.getByRole('button', { name: /primary/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /secondary/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /outline/i }),
        ).toBeInTheDocument();
    });
});
