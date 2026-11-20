import { Head, Link } from '@inertiajs/react';
import { Compass, Heart, Package, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSavedItems } from '@/hooks/use-saved-items';
import student from '@/routes/student';

const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    used: 'Used',
};

export default function Saved() {
    const { savedItems, removeSaved, clearSaved } = useSavedItems();

    return (
        <>
            <Head title="Saved Items - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Heart}
                    iconClassName="text-rose-500"
                    title="Saved Items"
                    description="Quick access to catalog items you bookmarked while browsing."
                    actions={
                        savedItems.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    clearSaved();
                                    toast.success('Cleared all saved items.');
                                }}
                                className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="size-3.5" />
                                Clear Saved
                            </Button>
                        )
                    }
                />

                {savedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Heart className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No saved items yet</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Tap the heart icon on any marketplace listing to bookmark it here for quick comparison later.
                        </p>
                        <Button asChild size="sm" className="mt-5 gap-1.5">
                            <Link href={student.browse().url}>
                                <Compass className="size-4" />
                                Browse Catalog
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savedItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-md"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        removeSaved(item.id);
                                        toast.success('Removed from saved items.');
                                    }}
                                    aria-label="Remove saved item"
                                    className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/85 backdrop-blur-xs border border-border/60 shadow-xs transition hover:scale-105 cursor-pointer"
                                >
                                    <Heart className="size-4 fill-rose-500 text-rose-500" />
                                </button>

                                <Link
                                    href={student.items.show({ item: item.id }).url}
                                    className="flex flex-1 flex-col"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="size-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Package className="size-10 opacity-30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {conditionLabels[item.condition] || item.condition}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between p-4">
                                        <div className="space-y-1.5">
                                            {item.category && (
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Tag className="size-3" />
                                                    <span>{item.category.name}</span>
                                                </div>
                                            )}
                                            <h3 className="line-clamp-2 font-semibold text-sm text-foreground group-hover:text-primary">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                                            <span className="font-extrabold text-base text-foreground">
                                                ₱
                                                {Number(item.price).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                            <span className="text-xs text-primary font-medium">
                                                View Listing →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </PageContainer>
        </>
    );
}

Saved.layout = {
    breadcrumbs: [
        {
            title: 'Saved Items',
            href: student.saved().url,
        },
    ],
};
