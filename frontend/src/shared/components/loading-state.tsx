'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
    return (
        <div className="py-24 text-center">
            <Loader2 className="text-foreground/30 mx-auto mb-4 size-10 animate-spin" />
            <p className="text-foreground/50 text-sm">{message}</p>
        </div>
    );
}
