import { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerDescription,
    SlidingDrawerHeader,
    SlidingDrawerTitle,
} from '@/components/ui/sliding-drawer';
import { toast } from 'sonner';
import student from '@/routes/student';
import {
    ImagePlus,
    Info,
    PlusCircle,
    Upload,
    X,
} from 'lucide-react';

export interface CategoryNode {
    id: number;
    name: string;
    children?: { id: number; name: string }[];
}

export interface ConditionOption {
    value: string;
    label: string;
}

interface PostItemDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: CategoryNode[];
    conditions: ConditionOption[];
    onSuccess?: () => void;
}

export function PostItemDrawer({
    open,
    onOpenChange,
    categories,
    conditions,
    onSuccess,
}: PostItemDrawerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset, isDirty } = useForm({
        category_id: '',
        title: '',
        description: '',
        condition: 'like_new',
        price: '',
        quantity: 1,
        images: [] as File[],
    });

    const hasDraftChanges = isDirty || data.images.length > 0;

    const handleDrawerOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && hasDraftChanges && !processing) {
            setShowDiscardConfirm(true);
            return;
        }
        onOpenChange(nextOpen);
    };

    const handleConfirmDiscard = () => {
        setShowDiscardConfirm(false);
        onOpenChange(false);
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    // Reset when drawer closes
    useEffect(() => {
        if (!open) {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setImagePreviews([]);
            reset();
        }
    }, [open]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);
        const combined = [...data.images, ...selectedFiles].slice(0, 5);

        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        const newPreviews = combined.map((file) => URL.createObjectURL(file));

        setData('images', combined);
        setImagePreviews(newPreviews);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const updatedImages = data.images.filter((_, idx) => idx !== indexToRemove);
        const updatedPreviews = imagePreviews.filter((_, idx) => {
            if (idx === indexToRemove) {
                URL.revokeObjectURL(imagePreviews[idx]);
                return false;
            }
            return true;
        });

        setData('images', updatedImages);
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(student.listings.store().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Item successfully registered!');
                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    return (
        <>
            <SlidingDrawer open={open} onOpenChange={handleDrawerOpenChange}>
                <SlidingDrawerContent
                    maxHeight="90vh"
                    desktopWidth="xl"
                >
                <SlidingDrawerHeader
                    icon={PlusCircle}
                    title="Post an Item for Sale"
                    description="Register your pre-owned academic gear, uniforms, or textbooks. Once submitted, you'll receive a drop-off QR code."
                />

                {/* Hub Workflow Reminder */}
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                        <span className="font-semibold text-primary">Consignment Model:</span>
                        <p className="mt-0.5 text-muted-foreground">
                            Items start in <strong>Pending Drop-off</strong> status. Bring your item to the Campus Hub desk with your QR code to be inspected and shelved live in the catalog.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                    {/* Item Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="drawer_title" className="text-xs font-semibold">
                            Item Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="drawer_title"
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
                            <Label htmlFor="drawer_category_id" className="text-xs font-semibold">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <NativeSelect
                                id="drawer_category_id"
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
                            <Label htmlFor="drawer_condition" className="text-xs font-semibold">
                                Condition <span className="text-destructive">*</span>
                            </Label>
                            <NativeSelect
                                id="drawer_condition"
                                value={data.condition}
                                onChange={(e) => setData('condition', e.target.value)}
                                required
                            >
                                {conditions.map((cond) => (
                                    <option key={cond.value} value={cond.value}>
                                        {cond.label}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={errors.condition} />
                        </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="drawer_price" className="text-xs font-semibold">
                                Price (PHP) <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-muted-foreground">
                                    ₱
                                </span>
                                <Input
                                    id="drawer_price"
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
                            <InputError message={errors.price} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="drawer_quantity" className="text-xs font-semibold">
                                Available Quantity <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="drawer_quantity"
                                type="number"
                                min="1"
                                max="100"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value, 10) || 1)}
                                required
                            />
                            <InputError message={errors.quantity} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="drawer_description" className="text-xs font-semibold">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="drawer_description"
                            rows={3}
                            placeholder="Describe condition, size, edition, or anything relevant for buyers..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            maxLength={2000}
                            required
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Explain condition accurately for staff inspection.</span>
                            <span>{data.description.length}/2000</span>
                        </div>
                        <InputError message={errors.description} />
                    </div>

                    {/* Photos Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">
                                Item Photos <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-[11px] text-muted-foreground">
                                {data.images.length}/5 selected
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                            {imagePreviews.map((previewUrl, index) => (
                                <div
                                    key={previewUrl}
                                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-xs"
                                >
                                    <img
                                        src={previewUrl}
                                        alt={`Upload preview ${index + 1}`}
                                        className="size-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        aria-label={`Remove photo ${index + 1}`}
                                        className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-destructive"
                                        title="Remove photo"
                                    >
                                        <X className="size-3.5" aria-hidden="true" />
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.2 text-[9px] font-medium text-white">
                                            Cover
                                        </span>
                                    )}
                                </div>
                            ))}

                            {data.images.length < 5 && (
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
                            onClick={() => handleDrawerOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || data.images.length === 0}
                            className="min-w-32"
                        >
                            {processing ? (
                                'Posting Item...'
                            ) : (
                                <>
                                    <Upload className="mr-1.5 size-3.5" aria-hidden="true" />
                                    Post for Approval
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SlidingDrawerContent>
        </SlidingDrawer>

            <ConfirmActionDialog
                open={showDiscardConfirm}
                onOpenChange={setShowDiscardConfirm}
                title="Discard draft listing?"
                description="You have unsaved listing details or photos. Closing now will clear your draft."
                confirmLabel="Discard Draft"
                cancelLabel="Keep Editing"
                onConfirm={handleConfirmDiscard}
            />
        </>
    );
}
