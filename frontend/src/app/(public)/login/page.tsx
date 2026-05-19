import { LoginForm } from '@/features/auth/components/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In – CTI Platform',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <LoginForm />
        </div>
    );
}
