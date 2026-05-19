'use client';

import { logoutApi } from '@/features/auth/api/auth.api';
import { useAuth } from '@/providers/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { refetch } = useAuth();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            await refetch();
            router.replace('/login');
        },
    });
}
