import type { LucideIcon } from 'lucide-react';

export interface TabDefinition<T extends string> {
    id: T;
    label: string;
    icon: LucideIcon;
}

interface DetailTabNavProps<T extends string> {
    tabs: readonly TabDefinition<T>[];
    activeTab: T;
    onTabChange: (tab: T) => void;
    ariaLabel?: string;
}

// Horizontal tab navigation bar shared by all detail pages.
export function DetailTabNav<T extends string>({
    tabs,
    activeTab,
    onTabChange,
    ariaLabel,
}: DetailTabNavProps<T>) {
    return (
        <div className="border-b">
            <nav
                className="-mb-px flex gap-1 overflow-x-auto"
                aria-label={ariaLabel}
            >
                {tabs.map(({ id: tabId, label, icon: Icon }) => (
                    <button
                        key={tabId}
                        onClick={() => onTabChange(tabId)}
                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tabId
                                ? 'border-primary text-primary'
                                : 'text-foreground/50 hover:border-foreground/20 hover:text-foreground/80 border-transparent'
                        }`}
                        aria-current={activeTab === tabId ? 'true' : undefined}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
