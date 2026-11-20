import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    DollarSign,
    Package,
    Tag,
    TrendingUp,
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
import student from '@/routes/student';
import type { PaginatedData } from '@/types/admin';

interface SoldOrderItem {
    id: number;
    quantity: number;
    price: string;
    total: string;
    payout_status: string;
    buyer_name: string | null;
    date: string | null;
    item: {
        id: number;
        title: string;
    } | null;
}

interface StudentSalesProps {
    soldItems: PaginatedData<SoldOrderItem>;
    totalEarned: string;
}

const payoutBadgeConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending: {
        label: 'Payout Pending',
        variant: 'outline',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    paid_digitally: {
        label: 'Paid to E-Wallet',
        variant: 'default',
        className: 'bg-emerald-600 text-white',
    },
    cash_held: {
        label: 'Cash Ready at Hub',
        variant: 'outline',
        className: 'border-ocean-teal/40 bg-ocean-teal/10 text-ocean-teal dark:text-seafoam-aqua',
    },
    cash_claimed: {
        label: 'Cash Claimed',
        variant: 'secondary',
    },
};

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function StudentSales({ soldItems, totalEarned }: StudentSalesProps) {
    const [selectedSale, setSelectedSale] = useState<SoldOrderItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Head title="My Sales - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={DollarSign}
                    title="Sales History"
                    description="Track your sold consignment items and disbursement status."
                    actions={
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={student.payouts().url}>
                                <Banknote className="size-4" />
                                View Payouts
                            </Link>
                        </Button>
                    }
                />

                {/* Summary Banner */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Total Earnings Disbursed
                            </p>
                            <p className="mt-1 text-3xl font-extrabold text-foreground">
                                {formatPeso(totalEarned)}
                            </p>
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="size-6" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Sold Line Items
                            </p>
                            <p className="mt-1 text-3xl font-extrabold text-foreground">
                                {soldItems.total}
                            </p>
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Tag className="size-6" />
                        </div>
                    </div>
                </div>

                {/* Sales List */}
                {soldItems.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Package className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No sales recorded yet</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Once a buyer reserves and completes pickup for one of your listings at the Hub, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                        <div className="divide-y divide-border">
                            {soldItems.data.map((sale) => {
                                const badge = payoutBadgeConfig[sale.payout_status] ?? {
                                    label: sale.payout_status,
                                    variant: 'outline' as const,
                                };
                                return (
                                    <button
                                        key={sale.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSale(sale);
                                            setDrawerOpen(true);
                                        }}
                                        className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left transition hover:bg-muted/40 cursor-pointer"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-sm text-foreground">
                                                    {sale.item?.title ?? 'Consigned Item'}
                                                </span>
                                                <Badge
                                                    variant={badge.variant}
                                                    className={`text-[10px] ${badge.className || ''}`}
                                                >
                                                    {badge.label}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <span>
                                                    Qty {sale.quantity} × {formatPeso(sale.price)}
                                                </span>
                                                {sale.buyer_name && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <User className="size-3" />
                                                        Buyer: {sale.buyer_name}
                                                    </span>
                                                )}
                                                {sale.date && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        {new Date(sale.date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right shrink-0">
                                            <span className="text-base font-extrabold text-foreground">
                                                {formatPeso(sale.total)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {soldItems.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {soldItems.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={soldItems.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {soldItems.current_page} of {soldItems.last_page}
                        </span>
                        {soldItems.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={soldItems.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            {/* Sale Detail Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedSale && (
                        <>
                            <SlidingDrawerHeader
                                icon={DollarSign}
                                title={`Sale Record #${selectedSale.id}`}
                                description="Breakdown of your sold item and Hub payout state."
                            />

                            <div className="mt-4 space-y-4 text-sm">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <p className="font-bold text-foreground">
                                        {selectedSale.item?.title ?? 'Consigned Item'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Quantity × Unit Price</span>
                                        <span>
                                            {selectedSale.quantity} × {formatPeso(selectedSale.price)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-2 font-extrabold text-foreground">
                                        <span>Total Seller Proceeds (0% Fee)</span>
                                        <span>{formatPeso(selectedSale.total)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1.5 border-b border-border/50">
                                        <span className="text-muted-foreground">Buyer</span>
                                        <span className="font-medium text-foreground">
                                            {selectedSale.buyer_name ?? 'Student Buyer'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border/50">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium text-foreground">
                                            {selectedSale.date
                                                ? new Date(selectedSale.date).toLocaleString()
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="text-muted-foreground">Payout Status</span>
                                        <Badge
                                            variant={
                                                payoutBadgeConfig[selectedSale.payout_status]
                                                    ?.variant ?? 'outline'
                                            }
                                            className={
                                                payoutBadgeConfig[selectedSale.payout_status]
                                                    ?.className
                                            }
                                        >
                                            {payoutBadgeConfig[selectedSale.payout_status]?.label ??
                                                selectedSale.payout_status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex justify-end gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={student.payouts().url}>Go to Payouts</Link>
                                </Button>
                                <SlidingDrawerClose asChild>
                                    <Button type="button" size="sm">
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

StudentSales.layout = {
    breadcrumbs: [
        {
            title: 'Sales',
            href: student.sales().url,
        },
    ],
};
