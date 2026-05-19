'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { registerApi } from '@/features/auth/api/auth.api';
import { useAuth } from '@/providers/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const queryClient = useQueryClient();
    const router = useRouter();
    const { refetch } = useAuth();

    const {
        mutate: register,
        isPending,
        error,
    } = useMutation({
        mutationFn: registerApi,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            await refetch();
            router.replace('/');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register({ email, password, name });
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 rounded-xl p-3">
                            <ShieldAlert className="text-primary size-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Create account
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Join the CTI Platform
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="name"
                                className="text-sm leading-none font-medium"
                            >
                                Name
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="text-sm leading-none font-medium"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="analyst@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="text-sm leading-none font-medium"
                            >
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="8+ characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoComplete="new-password"
                                disabled={isPending}
                            />
                        </div>

                        {error && (
                            <p className="text-destructive rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-950/20">
                                {error.message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>

                        <p className="text-muted-foreground text-center text-xs">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
