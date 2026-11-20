import { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import student from '@/routes/student';
import {
    ImagePlus,
    Pencil,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import type { CategoryNode, ConditionOption } from '@/components/post-item-drawer';

export interface EditListingItem {
    id: number;
    title: string;
    description: string;
    condition: string;
    price: string;
    quantity: number;
    category_id: number;
    image_urls: string[];
    images?: string[];
}

interface EditItemDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: EditListingItem;
    categories: CategoryNode[];
    conditions: ConditionOption[];
    onSuccess?: () => void;
}

export function EditItemDrawer({
    open,
    onOpenChange,
    item,
    categories,
    conditions,
    onSuccess,
}: EditItemDrawerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        category_id: String(item.category_id || ''),
        title: item.title || '',
        description: item.description || '',
        condition: item.condition || 'like_new',
        price: item.price || '',
        quantity: item.quantity || 1,
        images: [] as File[],
        remove_images: [] as string[],
    });

    // Clean up blob URLs
    useEffect(() => {
        return () => {
            newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [newImagePreviews]);

    // Reset when drawer closes or item changes
    useEffect(() => {
        if (!open) {
            newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setNewImagePreviews([]);
            reset();
        } else {
            setData({
                _method: 'put',
                category_id: String(item.category_id || ''),
                title: item.title || '',
                description: item.description || '',
                condition: item.condition || 'like_new',
                price: item.price || '',
                quantity: item.quantity || 1,
                images: [],
                remove_images: [],
            });
        }
    }, [open, item]);

    const existingImagesWithUrls = (item.images || []).map((path, idx) => ({
        path,
        url: item.image_urls[idx] || path,
    }));

    const activeExistingImages = existingImagesWithUrls.filter(
        (img) => !data.remove_images.includes(img.path)
    );

    const totalImageCount = activeExistingImages.length + data.images.length;

    const handleSelectNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const maxAllowed = 5 - activeExistingImages.length;
        const selectedFiles = Array.from(e.target.files).slice(0, Math.max(0, maxAllowed));

        const combined = [...data.images, ...selectedFiles].slice(0, maxAllowed);

        newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
        const newPreviews = combined.map((file) => URL.createObjectURL(file));

        setData('images', combined);
        setNewImagePreviews(newPreviews);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        const updatedImages = data.images.filter((_, idx) => idx !== indexToRemove);
        const updatedPreviews = newImagePreviews.filter((_, idx) => {
            if (idx === indexToRemove) {
                URL.revokeObjectURL(newImagePreviews[idx]);
                return false;
            }
            return true;
        });

        setData('images', updatedImages);
        setNewImagePreviews(updatedPreviews);
    };

    const handleRemoveExistingImage = (path: string) => {
        if (totalImageCount <= 1) {
            toast.error('The listing must have at least 1 image.');
            return;
        }
        setData('remove_images', [...data.remove_images, path]);
    };

    const handleRestoreExistingImage = (path: string) => {
        setData(
            'remove_images',
            data.remove_images.filter((p) => p !== path)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (totalImageCount < 1) {
            toast.error('Please include at least 1 image.');
            return;
        }

        post(student.listings.update({ item: item.id }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Listing successfully updated!');
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: () => {
                toast.error('Please check the form for errors.');
            },
        });
    };

    return (
        <SlidingDrawer open={open} onOpenChange={onOpenChange}>
            <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                <SlidingDrawerHeader
                    icon={Pencil}
                    title="Edit Listing"
                    description="Update details, pricing, condition, or photos for this item."
                />

                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                    {/* Item Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit_drawer_title" className="text-xs font-semibold">
                            Item Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit_drawer_title"
                            type="text"
                            placeholder="e.g. PE Uniform Men (Medium), Engineering Calculus Textbook"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            maxLength={120}
                            required
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Be descriptive with size, brand, or edition.</span>
                            <span>{data.title.length}/120</span>
                        </div>
                        <InputError message={errors.title} />
                    </div>

                    {/* Category & Condition */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_drawer_category_id" className="text-xs font-semibold">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <NativeSelect
                                id="edit_drawer_category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select category...
                                </option>
                                {categories.map((cat) => {
                                    if (cat.children && cat.children.length > 0) {
                                        return (
                                            <optgroup key={cat.id} label={cat.name}>
                                                {cat.children.map((child) => (
                                                    <option key={child.id} value={child.id}>
                                                        {child.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    }
                                    return (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    );
                                })}
                            </NativeSelect>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_drawer_condition" className="text-xs font-semibold">
                                Condition <span className="text-destructive">*</span>
                            </Label>
                            <NativeSelect
                                id="edit_drawer_condition"
                                value={data.condition}
                                onChange={(e) => setData('condition', e.target.value)}
                                required
                            >
                                {conditions.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={errors.condition} />
                        </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_drawer_price" className="text-xs font-semibold">
                                Price (₱) <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    ₱
                                </span>
                                <Input
                                    id="edit_drawer_price"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max="100000"
                                    placeholder="0.00"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="pl-7"
                                    required
                                />
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Minimum ₱1.00. Hub commission will apply upon sale.
                            </span>
                            <InputError message={errors.price} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_drawer_quantity" className="text-xs font-semibold">
                                Available Quantity <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit_drawer_quantity"
                                type="number"
                                min="1"
                                max="100"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value, 10) || 1)}
                                required
                            />
                            <span className="text-[11px] text-muted-foreground">
                                Number of identical units you are consigning.
                            </span>
                            <InputError message={errors.quantity} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit_drawer_description" className="text-xs font-semibold">
                            Item Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="edit_drawer_description"
                            rows={3}
                            placeholder="Describe any flaws, sizing details, textbook edition, or included accessories..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            maxLength={2000}
                            required
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Be transparent about marks or wear.</span>
                            <span>{data.description.length}/2000</span>
                        </div>
                        <InputError message={errors.description} />
                    </div>

                    {/* Photo Management */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">
                                Photos ({totalImageCount}/5) <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-[11px] text-muted-foreground">
                                At least 1 image required.
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleSelectNewImages}
                        />

                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                            {/* Existing Images */}
                            {existingImagesWithUrls.map((img) => {
                                const isRemoved = data.remove_images.includes(img.path);

                                return (
                                    <div
                                        key={img.path}
                                        className={`group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted ${
                                            isRemoved ? 'opacity-40 grayscale' : ''
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt="Item photo"
                                            className="size-full object-cover"
                                        />
                                        {isRemoved ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRestoreExistingImage(img.path)}
                                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-[10px] font-medium"
                                            >
                                                <span>Removed</span>
                                                <span className="underline">Undo</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(img.path)}
                                                aria-label="Remove existing photo"
                                                className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-destructive"
                                                title="Remove photo"
                                            >
                                                <Trash2 className="size-3.5" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {/* New Image Previews */}
                            {newImagePreviews.map((url, idx) => (
                                <div
                                    key={url}
                                    className="group relative aspect-square overflow-hidden rounded-xl border border-primary/50 bg-muted"
                                >
                                    <img
                                        src={url}
                                        alt={`New photo ${idx + 1}`}
                                        className="size-full object-cover"
                                    />
                                    <span className="absolute bottom-1 left-1 rounded bg-primary/80 px-1 py-0.5 text-[9px] font-semibold text-primary-foreground">
                                        New
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(idx)}
                                        aria-label={`Remove new photo ${idx + 1}`}
                                        className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-destructive"
                                        title="Remove photo"
                                    >
                                        <X className="size-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            ))}

                            {/* Add Photo Button */}
                            {totalImageCount < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/20 p-2 text-center text-muted-foreground transition hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
                                >
                                    <ImagePlus className="size-5" />
                                    <span className="text-[11px] font-medium">Add Photo</span>
                                </button>
                            )}
                        </div>

                        <InputError message={errors.images} />
                        {errors['images.0'] && <InputError message={errors['images.0']} />}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || totalImageCount === 0}
                            className="min-w-32"
                        >
                            {processing ? (
                                'Saving Changes...'
                            ) : (
                                <>
                                    <Save className="mr-1.5 size-3.5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SlidingDrawerContent>
        </SlidingDrawer>
    );
}
