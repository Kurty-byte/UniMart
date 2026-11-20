import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Calculator,
    CheckCircle2,
    Clock,
    User,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import admin from '@/routes/admin';
import type { PaginatedData } from '@/types/admin';

interface ShiftAuditRecord {
    id: number;
    staff: { id: number; name: string; email: string } | null;
    opening_cash: string;
    expected_cash: string | null;
    actual_cash: string | null;
    discrepancy: string | null;
    notes: string | null;
    shift_started_at: string | null;
    shift_ended_at: string | null;
}

interface AdminShiftAuditsProps {
    shifts: PaginatedData<ShiftAuditRecord>;
}

function formatPeso(amount: string | number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function ShiftAudits({ shifts }: AdminShiftAuditsProps) {
    const [selectedShift, setSelectedShift] = useState<ShiftAuditRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Head title="Shift Audits - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={Calculator}
                    title="Staff Shift & Drawer Audits"
                    description="Review staff opening floats, expected vs. counted drawer cash, and cash variances."
                />

                {shifts.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <Calculator className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">No shifts recorded</h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {shifts.data.map((shift) => {
                            const isOpen = shift.shift_ended_at === null;
                            const diff =
                                shift.discrepancy !== null ? Number(shift.discrepancy) : null;
                            const isBalanced = diff !== null && Math.abs(diff) < 0.005;

                            return (
                                <button
                                    key={shift.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedShift(shift);
                                        setDrawerOpen(true);
                                    }}
                                    className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 text-left hover:bg-muted/30 transition cursor-pointer"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-sm text-foreground">
                                                Shift #{shift.id}
                                            </span>
                                            {isOpen ? (
                                                <Badge className="bg-ocean-teal text-white text-[10px] gap-1">
                                                    <Clock className="size-3" />
                                                    Currently Open
                                                </Badge>
                                            ) : isBalanced ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] gap-1"
                                                >
                                                    <CheckCircle2 className="size-3" />
                                                    Balanced (₱0.00)
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[10px] gap-1"
                                                >
                                                    <AlertTriangle className="size-3" />
                                                    {diff !== null && diff > 0 ? '+' : ''}
                                                    {formatPeso(diff)} Variance
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                <User className="size-3" />
                                                {shift.staff?.name ?? 'Unknown Staff'}
                                            </span>
                                            {shift.shift_started_at && (
                                                <span>
                                                    Started{' '}
                                                    {new Date(
                                                        shift.shift_started_at,
                                                    ).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        {shift.notes && (
                                            <p className="text-xs text-muted-foreground italic line-clamp-1">
                                                &ldquo;{shift.notes}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-right shrink-0">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">
                                                Opening
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatPeso(shift.opening_cash)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">
                                                Expected
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatPeso(shift.expected_cash)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground block">
                                                Actual
                                            </span>
                                            <span className="font-extrabold text-foreground">
                                                {formatPeso(shift.actual_cash)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {shifts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {shifts.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={shifts.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {shifts.current_page} of {shifts.last_page}
                        </span>
                        {shifts.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={shifts.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedShift && (
                        <>
                            <SlidingDrawerHeader
                                icon={Calculator}
                                title={`Shift Audit #${selectedShift.id}`}
                                description={`Staff operator: ${selectedShift.staff?.name ?? 'Unknown'}`}
                            />

                            <div className="mt-4 space-y-4 text-xs">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                                        <span className="text-[10px] text-muted-foreground">
                                            Opening
                                        </span>
                                        <p className="mt-1 font-bold text-sm text-foreground">
                                            {formatPeso(selectedShift.opening_cash)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                                        <span className="text-[10px] text-muted-foreground">
                                            Expected
                                        </span>
                                        <p className="mt-1 font-bold text-sm text-foreground">
                                            {formatPeso(selectedShift.expected_cash)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                                        <span className="text-[10px] text-muted-foreground">
                                            Actual
                                        </span>
                                        <p className="mt-1 font-bold text-sm text-foreground">
                                            {formatPeso(selectedShift.actual_cash)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 rounded-xl border border-border p-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Staff Email</span>
                                        <span className="font-medium text-foreground">
                                            {selectedShift.staff?.email ?? '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shift Opened</span>
                                        <span className="font-medium text-foreground">
                                            {selectedShift.shift_started_at
                                                ? new Date(
                                                      selectedShift.shift_started_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shift Closed</span>
                                        <span className="font-medium text-foreground">
                                            {selectedShift.shift_ended_at
                                                ? new Date(
                                                      selectedShift.shift_ended_at,
                                                  ).toLocaleString()
                                                : 'Active / Still Open'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-2">
                                        <span className="text-muted-foreground">Discrepancy</span>
                                        <span className="font-bold text-foreground">
                                            {selectedShift.discrepancy !== null
                                                ? `${Number(selectedShift.discrepancy) > 0 ? '+' : ''}${formatPeso(selectedShift.discrepancy)}`
                                                : 'Pending Close'}
                                        </span>
                                    </div>
                                </div>

                                {selectedShift.notes && (
                                    <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                                        <p className="font-semibold uppercase text-[10px] text-muted-foreground">
                                            Staff Notes
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-foreground">
                                            {selectedShift.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <SlidingDrawerFooter className="mt-6">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Close
                                    </Button>
                                </SlidingDrawerClose>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

ShiftAudits.layout = {
    breadcrumbs: [
        {
            title: 'Shift Audits',
            href: admin.shiftAudits().url,
        },
    ],
};
