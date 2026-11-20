import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import { useSavedItems } from '@/hooks/use-saved-items';
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';
import {
    Clock,
    Flag,
    Heart,
    MessageCircle,
    Minus,
    Package,
    Plus,
    Send,
    ShoppingBag,
    ShoppingCart,
    Tag,
    User,
} from 'lucide-react';

export interface CatalogDetailItem {
    id: number;
    title: string;
    description?: string;
    condition: string;
    price: string;
    quantity: number;
    image_urls: string[];
    category: {
        id: number;
        name: string;
    } | null;
    seller: {
        id: number;
        name: string;
    } | null;
    shelf_expires_at?: string | null;
}

interface CatalogItemDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: CatalogDetailItem | null;
    isOwn?: boolean;
    canAddToCart?: boolean;
    inCartQuantity?: number;
    onSuccess?: () => void;
}

const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    used: 'Used',
};

export function CatalogItemDrawer({
    open,
    onOpenChange,
    item,
    isOwn = false,
    canAddToCart = true,
    inCartQuantity = 0,
    onSuccess,
}: CatalogItemDrawerProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showMessageForm, setShowMessageForm] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    const { isSaved, toggleSave } = useSavedItems();

    if (!item) return null;

    const availableQuantity = item.quantity;
    const isOutOfStock = availableQuantity <= 0;
    const saved = isSaved(item.id);

    const handleIncrement = () => {
        if (quantity < availableQuantity) {
            setQuantity((prev) => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleToggleSave = () => {
        const added = toggleSave({
            id: item.id,
            title: item.title,
            price: item.price,
            condition: item.condition,
            quantity: item.quantity,
            image_url: item.image_urls?.[0] ?? null,
            category: item.category,
        });
        toast.success(added ? 'Saved to your bookmarked items.' : 'Removed from saved items.');
    };

    const handleAddToCart = () => {
        if (!canAddToCart || isOutOfStock) return;

        setIsSubmitting(true);
        router.post(
            student.cart.items.store().url,
            {
                item_id: item.id,
                quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
                    setIsSubmitting(false);
                    onOpenChange(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const errorMsg = Object.values(errors)[0] as string | undefined;
                    toast.error(errorMsg || 'Unable to add item to cart.');
                },
            },
        );
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item.seller || !messageText.trim()) return;

        setSendingMessage(true);
        router.post(
            student.messages.store().url,
            {
                item_id: item.id,
                recipient_id: item.seller.id,
                content: messageText.trim(),
            },
            {
                onSuccess: () => {
                    toast.success('Message sent to seller!');
                    setMessageText('');
                    setShowMessageForm(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to send message.');
                },
                onFinish: () => setSendingMessage(false),
            },
        );
    };

    const handleSubmitReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (reportReason.trim().length < 5) {
            toast.error('Please provide at least 5 characters explaining your concern.');
            return;
        }

        setSubmittingReport(true);
        router.post(
            student.reports.store().url,
            {
                item_id: item.id,
                reported_user_id: item.seller?.id ?? null,
                reason: reportReason.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report submitted for admin review.');
                    setReportReason('');
                    setShowReportForm(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to submit report.');
                },
                onFinish: () => setSubmittingReport(false),
            },
        );
    };

    return (
        <SlidingDrawer open={open} onOpenChange={onOpenChange}>
            <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                <SlidingDrawerHeader
                    icon={ShoppingBag}
                    title="Item Details"
                    description="Specifications, condition, and hub catalog availability."
                />

                {/* Item Overview Card */}
                <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            {item.category && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                    <Tag className="size-3" />
                                    {item.category.name}
                                </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                                {conditionLabels[item.condition] || item.condition}
                            </Badge>
                            {isOutOfStock ? (
                                <Badge variant="destructive" className="text-xs">
                                    Out of Stock
                                </Badge>
                            ) : (
                                <Badge variant="default" className="bg-emerald-600 text-xs text-white">
                                    In Stock ({availableQuantity} available)
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    </div>

                    {!isOwn && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleToggleSave}
                            className="shrink-0 size-10 md:size-9"
                            aria-label={saved ? 'Remove from saved items' : 'Save item'}
                            aria-pressed={saved}
                            title={saved ? 'Remove from saved items' : 'Save item'}
                        >
                            <Heart
                                aria-hidden="true"
                                className={`size-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`}
                            />
                        </Button>
                    )}
                </div>

                <div className="mt-4 space-y-6">
                    {/* Image Viewer and Thumbnails */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                        <div className="space-y-2 md:col-span-5">
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
                                {item.image_urls && item.image_urls.length > 0 ? (
                                    <img
                                        src={item.image_urls[selectedImageIndex] || item.image_urls[0]}
                                        alt={item.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                        <Package className="size-12 opacity-30" />
                                    </div>
                                )}
                            </div>

                            {item.image_urls && item.image_urls.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {item.image_urls.map((url, idx) => (
                                        <button
                                            type="button"
                                            key={url}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                                selectedImageIndex === idx
                                                    ? 'border-primary ring-2 ring-primary/20'
                                                    : 'border-border opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="size-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price, Metadata, and Description */}
                        <div className="space-y-4 md:col-span-7">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-foreground tabular-nums">
                                    {formatPeso(item.price)}
                                </span>
                                <span className="text-xs text-muted-foreground">per unit</span>
                            </div>

                            {item.seller && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="size-3.5 text-primary" aria-hidden="true" />
                                    <span>Seller:</span>
                                    <span className="font-semibold text-foreground">
                                        {item.seller.name}
                                    </span>
                                </div>
                            )}

                            {item.description && (
                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Description
                                    </h4>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.shelf_expires_at && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                    <Clock className="size-3.5" />
                                    <span>
                                        Available until{' '}
                                        {new Date(item.shelf_expires_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase / Cart Actions */}
                    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                        {isOwn ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground">
                                    This is your listing. You cannot purchase your own consigned items.
                                </p>
                                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                                    <Link href={student.listings.show({ item: item.id }).url}>
                                        Manage Listing
                                    </Link>
                                </Button>
                            </div>
                        ) : isOutOfStock ? (
                            <Button disabled variant="secondary" className="w-full text-xs">
                                Currently Out of Stock
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                {inCartQuantity > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground">
                                        <span>
                                            Currently in your cart: <strong>{inCartQuantity}</strong>
                                        </span>
                                        <Link
                                            href={student.cart().url}
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            View Cart
                                        </Link>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-foreground">
                                        Quantity:
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-10 md:size-8"
                                            aria-label="Decrease quantity"
                                            onClick={handleDecrement}
                                            disabled={quantity <= 1 || isSubmitting}
                                        >
                                            <Minus className="size-3.5" aria-hidden="true" />
                                        </Button>
                                        <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                                            {quantity}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-10 md:size-8"
                                            aria-label="Increase quantity"
                                            onClick={handleIncrement}
                                            disabled={quantity >= availableQuantity || isSubmitting}
                                        >
                                            <Plus className="size-3.5" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isSubmitting || !canAddToCart}
                                    className="w-full gap-2 text-xs font-semibold"
                                >
                                    <ShoppingCart className="size-4" />
                                    {isSubmitting
                                        ? 'Adding to Cart...'
                                        : `Reserve in Cart • ₱${(Number(item.price) * quantity).toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })}`}
                                </Button>
                                <p className="text-[11px] text-center text-muted-foreground">
                                    Adding to cart places a 15-minute rolling Soft Hold while you browse.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* In-App Messaging & Reporting Actions for Buyers */}
                    {!isOwn && item.seller && (
                        <div className="space-y-3 border-t border-border pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant={showMessageForm ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setShowMessageForm((v) => !v);
                                        setShowReportForm(false);
                                    }}
                                    className="flex-1 gap-1.5 text-xs"
                                >
                                    <MessageCircle className="size-3.5" />
                                    Ask Seller a Question
                                </Button>
                                <Button
                                    type="button"
                                    variant={showReportForm ? 'destructive' : 'ghost'}
                                    size="sm"
                                    onClick={() => {
                                        setShowReportForm((v) => !v);
                                        setShowMessageForm(false);
                                    }}
                                    className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                                >
                                    <Flag className="size-3.5" />
                                    Report Listing
                                </Button>
                            </div>

                            {showMessageForm && (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-3.5"
                                >
                                    <Label htmlFor="ask_seller_message" className="text-xs font-semibold">
                                        Message {item.seller.name} about this item
                                    </Label>
                                    <Textarea
                                        id="ask_seller_message"
                                        rows={3}
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Ask about item condition, sizing, edition, or included accessories..."
                                        maxLength={1000}
                                        required
                                        className="bg-background"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowMessageForm(false)}
                                            className="text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={sendingMessage || !messageText.trim()}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Send className="size-3.5" />
                                            {sendingMessage ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {showReportForm && (
                                <form
                                    onSubmit={handleSubmitReport}
                                    className="space-y-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5"
                                >
                                    <Label htmlFor="report_item_reason" className="text-xs font-semibold text-destructive">
                                        Report a concern about this listing or seller
                                    </Label>
                                    <Textarea
                                        id="report_item_reason"
                                        rows={3}
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        placeholder="Describe why this listing violates UniMart guidelines or appears inaccurate..."
                                        minLength={5}
                                        maxLength={1000}
                                        required
                                        className="bg-background"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowReportForm(false)}
                                            className="text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="sm"
                                            disabled={submittingReport || reportReason.trim().length < 5}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Flag className="size-3.5" />
                                            {submittingReport ? 'Submitting...' : 'Submit Report'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </SlidingDrawerContent>
        </SlidingDrawer>
    );
}
