import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerHeader,
    SlidingDrawerTitle,
} from '@/components/ui/sliding-drawer';
import student from '@/routes/student';
import {
    Clock,
    Minus,
    Package,
    Plus,
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

    if (!item) return null;

    const availableQuantity = item.quantity;
    const isOutOfStock = availableQuantity <= 0;

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
            }
        );
    };

    return (
        <SlidingDrawer open={open} onOpenChange={onOpenChange}>
            <SlidingDrawerContent
                maxHeight="90vh"
                desktopWidth="xl"
            >
                <SlidingDrawerHeader
                    icon={ShoppingBag}
                    title="Item Details"
                    description="Specifications, condition, and hub catalog availability."
                />

                {/* Item Overview Card */}
                <div className="mt-4 space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4">
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
                    <h3 className="text-lg font-bold text-foreground">
                        {item.title}
                    </h3>
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
                                <span className="text-3xl font-extrabold text-foreground">
                                    ₱{Number(item.price).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    per unit
                                </span>
                            </div>

                            {item.seller && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="size-3.5 text-primary" />
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
                                    <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.shelf_expires_at && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                    <Clock className="size-3.5" />
                                    <span>
                                        Available until {new Date(item.shelf_expires_at).toLocaleDateString()}
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
                                    <p className="text-xs text-muted-foreground">
                                        You currently have <strong>{inCartQuantity}</strong> in your cart.
                                    </p>
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
                                            className="size-8"
                                            onClick={handleDecrement}
                                            disabled={quantity <= 1 || isSubmitting}
                                        >
                                            <Minus className="size-3" />
                                        </Button>
                                        <span className="min-w-8 text-center text-sm font-semibold">
                                            {quantity}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            onClick={handleIncrement}
                                            disabled={quantity >= availableQuantity || isSubmitting}
                                        >
                                            <Plus className="size-3" />
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
                                        : `Add to Cart • ₱${(Number(item.price) * quantity).toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          })}`}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SlidingDrawerContent>
        </SlidingDrawer>
    );
}
