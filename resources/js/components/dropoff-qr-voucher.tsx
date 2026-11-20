import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { Check, Copy, Download, Printer, QrCode, ShieldCheck, Store } from 'lucide-react';

interface DropoffQrVoucherProps {
    code: string;
    svg: string | null;
    itemTitle?: string;
    className?: string;
}

export function DropoffQrVoucher({
    code,
    svg,
    itemTitle,
    className = '',
}: DropoffQrVoucherProps) {
    const [copied, copy] = useClipboard();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleCopy = () => {
        copy(code);
    };

    const handleDownloadSvg = () => {
        if (!svg) return;
        setIsDownloading(true);
        try {
            const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unimart-dropoff-${code}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            className={`overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
        >
            <div className="border-b border-border bg-muted/40 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <QrCode className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Campus Hub Drop-off Voucher
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Present this QR code when handing over your item to UniMart Hub staff
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        Pending Hub Drop-off & Approval
                    </Badge>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center md:col-span-5">
                        <div className="relative aspect-square w-56 max-w-full rounded-2xl border-2 border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700">
                            {svg ? (
                                <div
                                    className="flex size-full items-center justify-center [&_svg]:size-full"
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                    <QrCode className="size-16 animate-pulse opacity-40" />
                                </div>
                            )}
                        </div>

                        {/* Unique Persistent ULID string */}
                        <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
                            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                Unique Item ID
                            </span>
                            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
                                <span>{code}</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    title="Copy unique code"
                                    className="text-muted-foreground transition hover:text-foreground"
                                >
                                    {copied === code ? (
                                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex w-full max-w-xs items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadSvg}
                                disabled={!svg || isDownloading}
                                className="flex-1 text-xs"
                            >
                                <Download className="mr-1.5 size-3.5" />
                                Download SVG
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="flex-1 text-xs"
                            >
                                <Printer className="mr-1.5 size-3.5" />
                                Print Voucher
                            </Button>
                        </div>
                    </div>

                    {/* Instructions & Hub Workflow */}
                    <div className="space-y-4 md:col-span-7">
                        {itemTitle && (
                            <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                <span className="text-xs text-muted-foreground">Registered Listing:</span>
                                <p className="font-medium text-foreground">{itemTitle}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-semibold text-foreground">
                                Next Steps for Student Sellers
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Your item is reserved in a pending drop-off status. Follow these steps to get it approved and placed in the live student catalog:
                            </p>
                        </div>

                        <ol className="space-y-3 text-xs">
                            <li className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                    1
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Bring the physical item to the Campus Hub
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Visit the designated UniMart Hub desk on campus during operating hours with the item ready for hand-in.
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                    2
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Present this QR voucher to the Staff
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Staff will scan this QR code on the desk system to pull up your listing instantly without manual typing.
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                    3
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Physical inspection & catalog activation
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Staff checks that the item matches your description, assigns a shelf code, and approves it. The item becomes immediately live in the catalog!
                                    </p>
                                </div>
                            </li>
                        </ol>

                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                            <ShieldCheck className="size-4 shrink-0" />
                            <span>
                                <strong>Safety Guaranteed:</strong> You never have to meet buyers or worry about fake payments. All transactions and cash handling are managed securely by Hub staff.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
