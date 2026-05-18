'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { IngestionResult, StixBundle } from '@/features/ingestion';
import { useIngestBundle } from '@/features/ingestion';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    FileJson,
    Loader2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */

function parseAndValidateBundle(raw: string): StixBundle | string {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return 'Invalid JSON: check the file syntax.';
    }

    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        (parsed as Record<string, unknown>).type !== 'bundle'
    ) {
        return 'Not a valid STIX 2.1 bundle — missing "type": "bundle".';
    }

    const objects = (parsed as Record<string, unknown>).objects;
    if (!Array.isArray(objects)) {
        return 'The bundle is missing the "objects" array field.';
    }

    if (objects.length === 0) {
        return 'The bundle is empty — "objects" contains no elements.';
    }

    return parsed as StixBundle;
}

/* ------------------------------------------------------------------ */
/*  Result display                                                    */
/* ------------------------------------------------------------------ */

interface ResultCardProps {
    result: IngestionResult;
}

function ResultCard({ result }: ResultCardProps) {
    const allOk = result.failed === 0;
    return (
        <div
            className={cn(
                'rounded-xl border p-4',
                allOk
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-amber-500/30 bg-amber-500/5',
            )}
        >
            <div className="mb-3 flex items-center gap-2">
                {allOk ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                    <AlertCircle className="size-4 text-amber-500" />
                )}
                <span className="text-sm font-semibold">
                    {allOk
                        ? 'Bundle ingested'
                        : 'Ingestion completed with errors'}
                </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-mono font-semibold">{result.total}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Processed</dt>
                    <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {result.processed}
                    </dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Skipped</dt>
                    <dd className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {result.skipped}
                    </dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Failed</dt>
                    <dd
                        className={cn(
                            'font-mono font-semibold',
                            result.failed > 0
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                        )}
                    >
                        {result.failed}
                    </dd>
                </div>
            </dl>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

interface IngestionPanelProps {
    /** Render the trigger inline — defaults to an icon button */
    trigger?: React.ReactNode;
}

export function IngestionPanel({ trigger }: IngestionPanelProps) {
    const [open, setOpen] = useState(false);
    const [raw, setRaw] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [result, setResult] = useState<IngestionResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        mutate,
        isPending,
        error: mutationError,
        reset,
    } = useIngestBundle();

    function handleRawChange(value: string) {
        setRaw(value);
        setValidationError(null);
        setResult(null);
        reset();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result;
            if (typeof text === 'string') {
                handleRawChange(text);
            }
        };
        reader.readAsText(file);
        // Reset input so the same file can be re-selected
        e.target.value = '';
    }

    function handleSubmit() {
        const bundle = parseAndValidateBundle(raw);
        if (typeof bundle === 'string') {
            setValidationError(bundle);
            return;
        }
        setValidationError(null);
        mutate(bundle, {
            onSuccess: (data) => setResult(data),
        });
    }

    function handleReset() {
        setRaw('');
        setValidationError(null);
        setResult(null);
        reset();
    }

    const hasContent = raw.trim().length > 0;
    const errorMessage =
        validationError ??
        (mutationError instanceof Error ? mutationError.message : null);

    return (
        <>
            {/* Trigger */}
            <span onClick={() => setOpen(true)} style={{ display: 'contents' }}>
                {trigger ?? (
                    <button
                        className="text-sidebar-foreground/50 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-200 hover:bg-white/5"
                        aria-label="Open ingestion panel"
                    >
                        <Upload className="size-5 shrink-0" />
                    </button>
                )}
            </span>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
                    showCloseButton={false}
                >
                    {/* Header */}
                    <SheetHeader className="border-b px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                                    <FileJson className="text-primary size-4" />
                                </div>
                                <div>
                                    <SheetTitle className="text-base font-semibold">
                                        STIX 2.1 Ingestion
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Import a STIX 2.1 bundle into the
                                        platform
                                    </SheetDescription>
                                </div>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                                aria-label="Close panel"
                                onClick={() => setOpen(false)}
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </SheetHeader>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                        {/* Result */}
                        {result && <ResultCard result={result} />}

                        {/* File upload */}
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                className="sr-only"
                                onChange={handleFileChange}
                                aria-label="Load JSON file"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPending}
                            >
                                <Upload className="size-3.5" />
                                Load .json file
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="bg-border h-px flex-1" />
                            <span className="text-muted-foreground text-xs">
                                or paste JSON
                            </span>
                            <div className="bg-border h-px flex-1" />
                        </div>

                        {/* Textarea */}
                        <div className="relative flex-1">
                            <Textarea
                                value={raw}
                                onChange={(e) =>
                                    handleRawChange(e.target.value)
                                }
                                placeholder={
                                    '{\n  "type": "bundle",\n  "id": "bundle--...",\n  "objects": [...]\n}'
                                }
                                className={cn(
                                    'min-h-64 resize-none font-mono text-xs',
                                    errorMessage &&
                                        'aria-invalid:border-destructive border-destructive',
                                )}
                                aria-invalid={errorMessage ? true : undefined}
                                disabled={isPending}
                                spellCheck={false}
                            />
                            {hasContent && (
                                <button
                                    onClick={handleReset}
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-2 right-2 rounded p-1 transition-colors"
                                    aria-label="Clear"
                                    disabled={isPending}
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>

                        {/* Validation / mutation error */}
                        {errorMessage && (
                            <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs">
                                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <SheetFooter className="border-t px-6 py-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={!hasContent || isPending}
                            className="w-full gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Processing…
                                </>
                            ) : (
                                <>
                                    <FileJson className="size-4" />
                                    Ingest bundle
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
