'use client';

import { getMeApi } from '@/features/auth/api/auth.api';
import type { AuthUser } from '@/features/auth/types';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    refetch: async () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const {
        data: user,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: getMeApi,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isAuthenticated: !!user,
                isLoading,
                refetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
