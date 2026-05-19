import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

describe('Home page', () => {
    it('redirects to /home', async () => {
        const { default: Home } = await import('@/app/page');
        Home();
        expect(redirect).toHaveBeenCalledWith('/home');
    });
});
