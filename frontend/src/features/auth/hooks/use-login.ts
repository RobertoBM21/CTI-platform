'use client';

import { loginApi } from '@/features/auth/api/auth.api';
import type { LoginCredentials } from '@/features/auth/types';
import { useAuth } from '@/providers/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { refetch } = useAuth();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            await refetch();
            router.replace('/');
        },
    });
}
