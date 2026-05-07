import { IncidentCatalog } from '@/features/incidents';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MOCK_INCIDENTS } from '../mock-data';

vi.mock('next/navigation', () => ({
    usePathname: () => '/incidents',
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    redirect: vi.fn(),
}));

vi.mock('../hooks/use-incidents', () => ({
    useIncidents: (search: string, filters: { tlp?: string }) => {
        let data = [...MOCK_INCIDENTS];
        if (search.trim()) {
            const term = search.toLowerCase();
            data = data.filter(
                (i) =>
                    i.name.toLowerCase().includes(term) ||
                    i.description?.toLowerCase().includes(term),
            );
        }
        if (filters.tlp) {
            data = data.filter((i) => i.tlp === filters.tlp);
        }
        return {
            data: {
                data: data.slice(0, 3),
                meta: {
                    total: data.length,
                    page: 1,
                    limit: 3,
                    totalPages: Math.ceil(data.length / 3),
                },
            },
            isLoading: false,
            isError: false,
        };
    },
}));

describe('IncidentCatalog', () => {
    it('renders the page heading', () => {
        render(<IncidentCatalog />);
        expect(
            screen.getByRole('heading', { name: /intelligence library/i }),
        ).toBeInTheDocument();
    });

    it('renders incident cards in list mode by default', () => {
        render(<IncidentCatalog />);
        expect(
            screen.getByText(/Zelenskyy's regime is doomed/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Ukrainian neo-Nazis/i)).toBeInTheDocument();
        expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });

    it('filters incidents by search text', async () => {
        const user = userEvent.setup();
        render(<IncidentCatalog />);
        const searchInput = screen.getByPlaceholderText(/search by title/i);
        await user.type(searchInput, 'CIA');
        expect(screen.getByText(/CIA and Ratcliffe/i)).toBeInTheDocument();
        expect(
            screen.queryByText(/Ukrainian neo-Nazis/i),
        ).not.toBeInTheDocument();
    });

    it('switches between list and grid view', async () => {
        const user = userEvent.setup();
        render(<IncidentCatalog />);
        const gridButton = screen.getByLabelText(/grid view/i);
        await user.click(gridButton);
        // All incidents should still be visible
        expect(screen.getByText(/Ukrainian neo-Nazis/i)).toBeInTheDocument();
    });

    it('shows and hides filters panel', async () => {
        const user = userEvent.setup();
        render(<IncidentCatalog />);
        expect(
            screen.queryByText(/traffic light protocol/i),
        ).not.toBeInTheDocument();
        const filtersButton = screen.getByRole('button', { name: /filters/i });
        await user.click(filtersButton);
        expect(screen.getByText(/traffic light protocol/i)).toBeInTheDocument();
    });
});
