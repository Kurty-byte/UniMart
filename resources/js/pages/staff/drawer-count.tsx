import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Calculator,
    CheckCircle2,
    Clock,
    DollarSign,
    Lock,
    Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import staff from '@/routes/staff';
import type { PaginatedData } from '@/types/admin';

interface ActiveShift {
    id: number;
    opening_cash: string;
    expected_cash: string;
    shift_started_at: string;
}

interface PastShift {
    id: number;
    opening_cash: string;
    expected_cash: string | null;
    actual_cash: string | null;
    notes: string | null;
    shift_started_at: string;
    shift_ended_at: string | null;
}

interface DrawerCountProps {
    activeShift: ActiveShift | null;
    pastShifts: PaginatedData<PastShift>;
}

function formatPeso(amount: string | number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function DrawerCount({ activeShift, pastShifts }: DrawerCountProps) {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [closeDrawer, setCloseDrawer] = useState(false);

    const openForm = useForm({
        opening_cash: '1000.00',
    });

    const closeForm = useForm({
        actual_cash: activeShift?.expected_cash ?? '',
        notes: '',
    });

    const handleOpenShift = (e: React.FormEvent) => {
        e.preventDefault();
        openForm.post(staff.shifts.open().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Desk shift opened! You can now process cash claims and payouts.');
                setOpenDrawer(false);
                openForm.reset();
            },
            onError: () => toast.error('Unable to open shift.'),
        });
    };

    const handleCloseShift = (e: React.FormEvent) => {
        e.preventDefault();
        closeForm.post(staff.shifts.close().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Shift drawer count submitted and logged for admin audit.');
                setCloseDrawer(false);
                closeForm.reset();
            },
            onError: () => toast.error('Unable to close shift.'),
        });
    };

    const liveDiscrepancy =
        activeShift && closeForm.data.actual_cash !== ''
            ? Number(closeForm.data.actual_cash) - Number(activeShift.expected_cash)
            : null;

    return (
        <>
            <Head title="Shift & Drawer Count - UniMart Staff" />

            <PageContainer>
                <PageHeader
                    icon={Calculator}
                    title="Shift & Cash Drawer Count"
                    description="Open your Hub desk shift with an initial cash float and reconcile counted cash at end-of-shift."
                />

                {/* Active Shift Status Card */}
                {activeShift ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-xs space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-600 text-white gap-1">
                                        <Unlock className="size-3" />
                                        Shift Active (#{activeShift.id})
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3.5" />
                                        Started{' '}
                                        {new Date(activeShift.shift_started_at).toLocaleString()}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-foreground">
                                    Live Desk Cash Drawer
                                </h2>
                            </div>

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    closeForm.setData('actual_cash', activeShift.expected_cash);
                                    setCloseDrawer(true);
                                }}
                                className="gap-1.5"
                            >
                                <Lock className="size-4" />
                                Submit End-of-Shift Count
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <span className="text-xs text-muted-foreground">
                                    Opening Float
                                </span>
                                <p className="mt-1 text-xl font-extrabold text-foreground">
                                    {formatPeso(activeShift.opening_cash)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <span className="text-xs text-muted-foreground">
                                    Net Cash Flow (Sales − Cash Payouts)
                                </span>
                                <p className="mt-1 text-xl font-extrabold text-foreground">
                                    {formatPeso(
                                        Number(activeShift.expected_cash) -
                                            Number(activeShift.opening_cash),
                                    )}
                                </p>
                            </div>
                            <div className="rounded-xl border border-ocean-teal/40 bg-ocean-teal/10 p-4">
                                <span className="text-xs font-medium text-ocean-teal dark:text-seafoam-aqua">
                                    Expected Cash in Drawer
                                </span>
                                <p className="mt-1 text-xl font-extrabold text-ocean-teal dark:text-seafoam-aqua">
                                    {formatPeso(activeShift.expected_cash)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/5 p-8 text-center space-y-4">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Lock className="size-7" />
                        </div>
                        <div className="space-y-1 max-w-md mx-auto">
                            <h2 className="text-lg font-bold text-foreground">
                                No Active Desk Shift
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Enter your opening drawer float to start your shift. Opening a shift is required to record buyer cash payments and release held cash payouts.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setOpenDrawer(true)}
                            className="gap-1.5"
                        >
                            <Unlock className="size-4" />
                            Open New Shift
                        </Button>
                    </div>
                )}

                {/* Past Shifts History */}
                <div className="space-y-3">
                    <h2 className="text-base font-bold text-foreground">
                        My Past Reconciled Shifts
                    </h2>

                    {pastShifts.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                            You have not closed any shifts yet.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                            {pastShifts.data.map((shift) => {
                                const discrepancy =
                                    shift.actual_cash !== null && shift.expected_cash !== null
                                        ? Number(shift.actual_cash) - Number(shift.expected_cash)
                                        : 0;
                                const isBalanced = Math.abs(discrepancy) < 0.005;

                                return (
                                    <div
                                        key={shift.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">
                                                    Shift #{shift.id}
                                                </span>
                                                {isBalanced ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] gap-1"
                                                    >
                                                        <CheckCircle2 className="size-3" />
                                                        Balanced
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-[10px] gap-1"
                                                    >
                                                        <AlertTriangle className="size-3" />
                                                        {discrepancy > 0 ? '+' : ''}
                                                        {formatPeso(discrepancy)} Variance
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground">
                                                {new Date(shift.shift_started_at).toLocaleString()} →{' '}
                                                {shift.shift_ended_at
                                                    ? new Date(
                                                          shift.shift_ended_at,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </p>
                                            {shift.notes && (
                                                <p className="text-muted-foreground italic">
                                                    &ldquo;{shift.notes}&rdquo;
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-right shrink-0">
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
                                                    Actual Counted
                                                </span>
                                                <span className="font-extrabold text-foreground">
                                                    {formatPeso(shift.actual_cash)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pastShifts.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            {pastShifts.prev_page_url && (
                                <Button asChild variant="outline" size="sm" className="text-xs">
                                    <Link href={pastShifts.prev_page_url} preserveState>
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            <span className="text-xs text-muted-foreground">
                                Page {pastShifts.current_page} of {pastShifts.last_page}
                            </span>
                            {pastShifts.next_page_url && (
                                <Button asChild variant="outline" size="sm" className="text-xs">
                                    <Link href={pastShifts.next_page_url} preserveState>
                                        Next
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </PageContainer>

            {/* Open Shift Drawer */}
            <SlidingDrawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="md">
                    <SlidingDrawerHeader
                        icon={Unlock}
                        title="Open Desk Shift"
                        description="Record the starting cash float inside the Hub desk drawer."
                    />

                    <form onSubmit={handleOpenShift} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="opening_cash" className="text-xs font-semibold">
                                Opening Cash Float (₱) *
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="opening_cash"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={openForm.data.opening_cash}
                                    onChange={(e) =>
                                        openForm.setData('opening_cash', e.target.value)
                                    }
                                    className="pl-9"
                                    required
                                />
                            </div>
                            <InputError message={openForm.errors.opening_cash} />
                        </div>

                        <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <SlidingDrawerClose asChild>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </SlidingDrawerClose>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={openForm.processing}
                                className="gap-1.5"
                            >
                                <Unlock className="size-4" />
                                {openForm.processing ? 'Opening...' : 'Start Shift'}
                            </Button>
                        </SlidingDrawerFooter>
                    </form>
                </SlidingDrawerContent>
            </SlidingDrawer>

            {/* Close Shift Drawer */}
            <SlidingDrawer open={closeDrawer} onOpenChange={setCloseDrawer}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {activeShift && (
                        <>
                            <SlidingDrawerHeader
                                icon={Lock}
                                title="End-of-Shift Drawer Count"
                                description="Count physical cash in the drawer and log your reconciliation for Admin audit."
                            />

                            <form onSubmit={handleCloseShift} className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        System Expected Cash
                                    </span>
                                    <span className="text-base font-extrabold text-foreground">
                                        {formatPeso(activeShift.expected_cash)}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="actual_cash" className="text-xs font-semibold">
                                        Actual Counted Cash (₱) *
                                    </Label>
                                    <Input
                                        id="actual_cash"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={closeForm.data.actual_cash}
                                        onChange={(e) =>
                                            closeForm.setData('actual_cash', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={closeForm.errors.actual_cash} />
                                </div>

                                {liveDiscrepancy !== null && (
                                    <div
                                        className={`rounded-xl border p-3 text-xs flex items-center justify-between ${
                                            Math.abs(liveDiscrepancy) < 0.005
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                                                : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                                        }`}
                                    >
                                        <span className="font-semibold">
                                            {Math.abs(liveDiscrepancy) < 0.005
                                                ? 'Drawer Balanced'
                                                : liveDiscrepancy > 0
                                                  ? 'Overage Detected'
                                                  : 'Shortage Detected'}
                                        </span>
                                        <span className="font-mono font-bold">
                                            {liveDiscrepancy > 0 ? '+' : ''}
                                            {formatPeso(liveDiscrepancy)}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="shift_notes" className="text-xs font-semibold">
                                        Reconciliation Notes (Optional)
                                    </Label>
                                    <Textarea
                                        id="shift_notes"
                                        rows={3}
                                        value={closeForm.data.notes}
                                        onChange={(e) =>
                                            closeForm.setData('notes', e.target.value)
                                        }
                                        placeholder="Add notes about any variance, change denominations, or shift handoff..."
                                        maxLength={1000}
                                        className="bg-background"
                                    />
                                    <InputError message={closeForm.errors.notes} />
                                </div>

                                <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                    <SlidingDrawerClose asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            Cancel
                                        </Button>
                                    </SlidingDrawerClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={closeForm.processing}
                                        className="gap-1.5"
                                    >
                                        <Lock className="size-4" />
                                        {closeForm.processing
                                            ? 'Closing Shift...'
                                            : 'Submit Count & Close Shift'}
                                    </Button>
                                </SlidingDrawerFooter>
                            </form>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

DrawerCount.layout = {
    breadcrumbs: [
        {
            title: 'Drawer Count',
            href: staff.drawerCount().url,
        },
    ],
};
