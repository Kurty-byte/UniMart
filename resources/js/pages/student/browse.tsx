import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import { useSavedItems } from '@/hooks/use-saved-items';
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';
import { toast } from 'sonner';
import {
    Compass,
    Heart,
    Package,
    Search,
    Tag,
    SlidersHorizontal,
    X,
} from 'lucide-react';

export interface CategoryTreeItem {
    id: number;
    name: string;
    children?: { id: number; name: string }[];
}

export interface ConditionOption {
    value: string;
    label: string;
}

export interface CatalogItemSummary {
    id: number;
    title: string;
    price: string;
    condition: string;
    quantity: number;
    image_url: string | null;
    category: {
        id: number;
        name: string;
    } | null;
    is_own: boolean;
}

interface PaginationData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface BrowseProps {
    items: PaginationData<CatalogItemSummary>;
    categories: CategoryTreeItem[];
    conditions: ConditionOption[];
    filters: {
        search: string | null;
        category: number | string | null;
        condition: string | null;
        min_price: number | string | null;
        max_price: number | string | null;
        sort: string;
    };
}

const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    used: 'Used',
};

export default function Browse({
    items,
    categories = [],
    conditions = [],
    filters,
}: BrowseProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category ? String(filters.category) : '');
    const [condition, setCondition] = useState(filters.condition || '');
    const [minPrice, setMinPrice] = useState(filters.min_price ? String(filters.min_price) : '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ? String(filters.max_price) : '');
    const [sort, setSort] = useState(filters.sort || 'newest');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { isSaved, toggleSave } = useSavedItems();

    const handleApplyFilters = (newOverrides?: Record<string, string | null>) => {
        const query: Record<string, string> = {};

        const effectiveSearch = newOverrides && 'search' in newOverrides ? newOverrides.search : search;
        const effectiveCategory = newOverrides && 'category' in newOverrides ? newOverrides.category : category;
        const effectiveCondition = newOverrides && 'condition' in newOverrides ? newOverrides.condition : condition;
        const effectiveMinPrice = newOverrides && 'min_price' in newOverrides ? newOverrides.min_price : minPrice;
        const effectiveMaxPrice = newOverrides && 'max_price' in newOverrides ? newOverrides.max_price : maxPrice;
        const effectiveSort = newOverrides && 'sort' in newOverrides ? newOverrides.sort : sort;

        if (effectiveSearch) query.search = effectiveSearch;
        if (effectiveCategory) query.category = effectiveCategory;
        if (effectiveCondition) query.condition = effectiveCondition;
        if (effectiveMinPrice) query.min_price = effectiveMinPrice;
        if (effectiveMaxPrice) query.max_price = effectiveMaxPrice;
        if (effectiveSort && effectiveSort !== 'newest') query.sort = effectiveSort;

        router.get(student.browse().url, query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleApplyFilters();
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setCondition('');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        router.get(student.browse().url, {}, { preserveState: true, replace: true });
    };

    const activeFilterCount = [
        Boolean(filters.category),
        Boolean(filters.condition),
        Boolean(filters.min_price),
        Boolean(filters.max_price),
        Boolean(filters.sort && filters.sort !== 'newest'),
    ].filter(Boolean).length;

    const hasActiveFilters = Boolean(filters.search) || activeFilterCount > 0;

    return (
        <>
            <Head title="Campus Catalog - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Compass}
                    title="Campus Marketplace"
                    description="Browse verified consignment gear, textbooks, and uniforms available at the Hub."
                    actions={
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {items.total} {items.total === 1 ? 'item' : 'items'} in catalog
                        </span>
                    }
                />

                {/* Search & Filter Bar */}
                <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="space-y-3">
                        <div className="flex items-center gap-2 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    type="search"
                                    aria-label="Search marketplace items"
                                    placeholder="Search by title, edition, or keywords..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Mobile Compact Filters Trigger */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="gap-1.5 md:hidden shrink-0"
                                aria-label="Open catalog filters"
                            >
                                <SlidersHorizontal className="size-4" aria-hidden="true" />
                                <span>Filters</span>
                                {activeFilterCount > 0 && (
                                    <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px] tabular-nums">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* Desktop Inline Select Filters */}
                            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
                                {/* Category / Course Filter */}
                                <NativeSelect
                                    aria-label="Filter by course or category"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        handleApplyFilters({ category: e.target.value || null });
                                    }}
                                    className="w-auto min-w-44"
                                >
                                    <option value="">All Courses & Categories</option>
                                    {categories.map((cat) => {
                                        if (cat.children && cat.children.length > 0) {
                                            return (
                                                <optgroup key={cat.id} label={cat.name}>
                                                    <option value={String(cat.id)}>
                                                        All {cat.name}
                                                    </option>
                                                    {cat.children.map((child) => (
                                                        <option key={child.id} value={String(child.id)}>
                                                            {child.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        }
                                        return (
                                            <option key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>

                                {/* Condition Filter */}
                                <NativeSelect
                                    aria-label="Filter by condition"
                                    value={condition}
                                    onChange={(e) => {
                                        setCondition(e.target.value);
                                        handleApplyFilters({ condition: e.target.value || null });
                                    }}
                                    className="w-auto min-w-36"
                                >
                                    <option value="">All Conditions</option>
                                    {conditions.map((cond) => (
                                        <option key={cond.value} value={cond.value}>
                                            {cond.label}
                                        </option>
                                    ))}
                                </NativeSelect>

                                {/* Sort Filter */}
                                <NativeSelect
                                    aria-label="Sort items"
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        handleApplyFilters({ sort: e.target.value });
                                    }}
                                    className="w-auto min-w-40"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </NativeSelect>
                            </div>
                        </div>

                        {/* Desktop Price Range & Apply Controls */}
                        <div className="hidden md:flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Price (₱):</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    aria-label="Minimum price"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="h-8 w-24"
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    aria-label="Maximum price"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="h-8 w-24"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" className="h-8 gap-1.5 text-xs">
                                    <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                                    Apply Filters
                                </Button>

                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3.5" aria-hidden="true" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Mobile Filter Drawer */}
                <SlidingDrawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SlidingDrawerContent maxHeight="85vh">
                        <SlidingDrawerHeader
                            icon={SlidersHorizontal}
                            title="Filter & Sort Catalog"
                            description="Narrow down campus gear by course, condition, and price."
                        />
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleApplyFilters();
                                setMobileFiltersOpen(false);
                            }}
                            className="mt-4 space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="mobile_filter_category" className="text-xs font-semibold">
                                    Course & Category
                                </Label>
                                <NativeSelect
                                    id="mobile_filter_category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">All Courses & Categories</option>
                                    {categories.map((cat) => {
                                        if (cat.children && cat.children.length > 0) {
                                            return (
                                                <optgroup key={cat.id} label={cat.name}>
                                                    <option value={String(cat.id)}>
                                                        All {cat.name}
                                                    </option>
                                                    {cat.children.map((child) => (
                                                        <option key={child.id} value={String(child.id)}>
                                                            {child.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        }
                                        return (
                                            <option key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="mobile_filter_condition" className="text-xs font-semibold">
                                        Condition
                                    </Label>
                                    <NativeSelect
                                        id="mobile_filter_condition"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                    >
                                        <option value="">All Conditions</option>
                                        {conditions.map((cond) => (
                                            <option key={cond.value} value={cond.value}>
                                                {cond.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="mobile_filter_sort" className="text-xs font-semibold">
                                        Sort By
                                    </Label>
                                    <NativeSelect
                                        id="mobile_filter_sort"
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </NativeSelect>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Price Range (₱)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        aria-label="Minimum price"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        aria-label="Maximum price"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                                {hasActiveFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            handleClearFilters();
                                            setMobileFiltersOpen(false);
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                ) : (
                                    <SlidingDrawerClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </SlidingDrawerClose>
                                )}
                                <Button type="submit">Apply Filters</Button>
                            </SlidingDrawerFooter>
                        </form>
                    </SlidingDrawerContent>
                </SlidingDrawer>

                {/* Items Grid */}
                {items.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Compass className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No items match your search</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Try adjusting your filters or search terms, or check back later as students consign items daily.
                        </p>
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                                className="mt-5 text-xs"
                                size="sm"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.data.map((item) => {
                            const saved = isSaved(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition hover:border-primary/40 hover:shadow-md"
                                >
                                    {!item.is_own && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const added = toggleSave(item);
                                                toast.success(
                                                    added
                                                        ? 'Saved to your bookmarked items.'
                                                        : 'Removed from saved items.',
                                                );
                                            }}
                                            aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
                                            aria-pressed={saved}
                                            className="absolute top-2 right-2 z-10 flex size-10 items-center justify-center rounded-full bg-background/85 backdrop-blur-xs border border-border/60 shadow-xs transition hover:scale-105 cursor-pointer md:size-8"
                                        >
                                            <Heart
                                                aria-hidden="true"
                                                className={`size-4 ${
                                                    saved
                                                        ? 'fill-rose-500 text-rose-500'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        </button>
                                    )}

                                    <Link
                                        href={student.items.show({ item: item.id }).url}
                                        onClick={() => {
                                            sessionStorage.setItem(
                                                'unimart:fromBrowse',
                                                window.location.pathname + window.location.search,
                                            );
                                        }}
                                        className="flex flex-1 flex-col"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                    <Package className="size-10 opacity-30" aria-hidden="true" />
                                                </div>
                                            )}

                                            <div className="absolute top-2 left-2 flex gap-1.5">
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {conditionLabels[item.condition] || item.condition}
                                                </Badge>
                                                {item.is_own && (
                                                    <Badge variant="default" className="bg-primary/90 text-[10px]">
                                                        Your Listing
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex flex-1 flex-col justify-between p-4">
                                            <div className="space-y-1.5">
                                                {item.category && (
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <Tag className="size-3" aria-hidden="true" />
                                                        <span>{item.category.name}</span>
                                                    </div>
                                                )}
                                                <h3 className="line-clamp-2 font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                                                <span className="font-extrabold text-foreground text-base tabular-nums">
                                                    {formatPeso(item.price)}
                                                </span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {items.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {items.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={items.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {items.current_page} of {items.last_page}
                        </span>
                        {items.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={items.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>
        </>
    );
}

Browse.layout = {
    breadcrumbs: [
        {
            title: 'Browse',
            href: student.browse().url,
        },
    ],
};
