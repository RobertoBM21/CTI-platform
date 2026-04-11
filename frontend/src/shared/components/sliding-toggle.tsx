'use client';

import { cn } from '@/lib/utils';

interface ToggleOption<T extends string> {
    value: T;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

interface SlidingToggleProps<T extends string> {
    options: [ToggleOption<T>, ToggleOption<T>];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export function SlidingToggle<T extends string>({
    options,
    value,
    onChange,
    className,
}: SlidingToggleProps<T>) {
    const activeIndex = options.findIndex((o) => o.value === value);

    return (
        <div
            className={cn(
                'bg-muted/50 border-border/70 relative flex h-10 rounded-xl border p-1 dark:border-transparent dark:bg-transparent',
                className,
            )}
        >
            {/* Sliding background pill */}
            <div
                className="bg-card absolute top-1 bottom-1 rounded-lg shadow-sm transition-[left] duration-200 ease-out dark:border dark:border-white/10 dark:bg-white/8 dark:shadow-none"
                style={{
                    width: 'calc(50% - 4px)',
                    left: activeIndex === 0 ? '4px' : '50%',
                }}
            />

            {options.map((option) => {
                const Icon = option.icon;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'relative z-10 flex size-8 items-center justify-center rounded-lg transition-colors',
                            value === option.value
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground dark:text-white/55 dark:hover:text-white/90',
                        )}
                        aria-label={option.label}
                        aria-pressed={value === option.value}
                    >
                        <Icon className="size-[18px]" />
                    </button>
                );
            })}
        </div>
    );
}
