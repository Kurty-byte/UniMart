import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { FolderTree, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import InputError from '@/components/input-error';
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
import admin from '@/routes/admin';

interface CategoryChild {
    id: number;
    name: string;
    items_count: number;
}

interface RootCategory {
    id: number;
    name: string;
    items_count: number;
    children: CategoryChild[];
}

interface AdminCategoriesProps {
    categories: RootCategory[];
}

export default function Categories({ categories = [] }: AdminCategoriesProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<{
        id: number;
        name: string;
        parent_id: number | null;
    } | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const createForm = useForm({
        name: '',
        parent_id: '',
    });

    const editForm = useForm({
        name: '',
        parent_id: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.transform((d) => ({
            name: d.name,
            parent_id: d.parent_id ? Number(d.parent_id) : null,
        }));
        createForm.post(admin.categories.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Category created.');
                setCreateOpen(false);
                createForm.reset();
            },
            onError: () => toast.error('Please check the category fields.'),
        });
    };

    const openEdit = (cat: { id: number; name: string; parent_id: number | null }) => {
        setEditTarget(cat);
        editForm.setData({
            name: cat.name,
            parent_id: cat.parent_id ? String(cat.parent_id) : '',
        });
        editForm.clearErrors();
        setEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.transform((d) => ({
            name: d.name,
            parent_id: d.parent_id ? Number(d.parent_id) : null,
        }));
        editForm.put(admin.categories.update({ category: editTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Category updated.');
                setEditOpen(false);
                setEditTarget(null);
            },
            onError: () => toast.error('Unable to update category.'),
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        const { id, name } = deleteTarget;
        setDeletingId(id);
        router.delete(admin.categories.destroy({ category: id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Category "${name}" deleted.`);
                setDeleteTarget(null);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] as string | undefined;
                toast.error(msg || 'Remove items and sub-categories first.');
            },
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <>
            <Head title="Categories & Courses - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={Tags}
                    title="Categories & College Courses"
                    description="Manage parent departments/categories and course subcategories used for catalog filtering."
                    actions={
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                                createForm.reset();
                                createForm.clearErrors();
                                setCreateOpen(true);
                            }}
                            className="gap-1.5"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </Button>
                    }
                />

                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <FolderTree className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">No categories defined</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {categories.map((root) => (
                            <div
                                key={root.id}
                                className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col"
                            >
                                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-bold text-sm text-foreground truncate">
                                            {root.name}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {root.items_count} items
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${root.name}`}
                                            className="size-9 md:size-8"
                                            onClick={() =>
                                                openEdit({
                                                    id: root.id,
                                                    name: root.name,
                                                    parent_id: null,
                                                })
                                            }
                                        >
                                            <Pencil className="size-3.5" aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Delete ${root.name}`}
                                            disabled={deletingId === root.id}
                                            className="size-9 md:size-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteTarget({ id: root.id, name: root.name })}
                                        >
                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="divide-y divide-border p-2 flex-1">
                                    {root.children.length === 0 ? (
                                        <p className="p-3 text-xs text-muted-foreground">
                                            No sub-categories under {root.name}.
                                        </p>
                                    ) : (
                                        root.children.map((child) => (
                                            <div
                                                key={child.id}
                                                className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs hover:bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-medium text-foreground truncate">
                                                        {child.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {child.items_count}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Edit ${child.name}`}
                                                        className="size-9 md:size-8"
                                                        onClick={() =>
                                                            openEdit({
                                                                id: child.id,
                                                                name: child.name,
                                                                parent_id: root.id,
                                                            })
                                                        }
                                                    >
                                                        <Pencil className="size-3" aria-hidden="true" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Delete ${child.name}`}
                                                        disabled={deletingId === child.id}
                                                        className="size-9 md:size-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            setDeleteTarget({ id: child.id, name: child.name })
                                                        }
                                                    >
                                                        <Trash2 className="size-3" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PageContainer>

            {/* Create Category Drawer */}
            <SlidingDrawer open={createOpen} onOpenChange={setCreateOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="md">
                    <SlidingDrawerHeader
                        icon={Plus}
                        title="Create Category"
                        description="Add a top-level college/category or a course subcategory."
                    />
                    <form onSubmit={handleCreate} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cat_name" className="text-xs font-semibold">
                                Category / Course Name *
                            </Label>
                            <Input
                                id="cat_name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. BS Computer Science, PE Uniforms"
                                maxLength={80}
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cat_parent" className="text-xs font-semibold">
                                Parent Category (Optional)
                            </Label>
                            <NativeSelect
                                id="cat_parent"
                                value={createForm.data.parent_id}
                                onChange={(e) => createForm.setData('parent_id', e.target.value)}
                            >
                                <option value="">None (Root Category)</option>
                                {categories.map((root) => (
                                    <option key={root.id} value={String(root.id)}>
                                        {root.name}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={createForm.errors.parent_id} />
                        </div>

                        <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <SlidingDrawerClose asChild>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </SlidingDrawerClose>
                            <Button type="submit" size="sm" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create Category'}
                            </Button>
                        </SlidingDrawerFooter>
                    </form>
                </SlidingDrawerContent>
            </SlidingDrawer>

            {/* Edit Category Drawer */}
            <SlidingDrawer open={editOpen} onOpenChange={setEditOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="md">
                    <SlidingDrawerHeader
                        icon={Pencil}
                        title="Edit Category"
                        description="Rename or reassign this category's parent."
                    />
                    <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_cat_name" className="text-xs font-semibold">
                                Category / Course Name *
                            </Label>
                            <Input
                                id="edit_cat_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                maxLength={80}
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_cat_parent" className="text-xs font-semibold">
                                Parent Category
                            </Label>
                            <NativeSelect
                                id="edit_cat_parent"
                                value={editForm.data.parent_id}
                                onChange={(e) => editForm.setData('parent_id', e.target.value)}
                            >
                                <option value="">None (Root Category)</option>
                                {categories
                                    .filter((r) => r.id !== editTarget?.id)
                                    .map((root) => (
                                        <option key={root.id} value={String(root.id)}>
                                            {root.name}
                                        </option>
                                    ))}
                            </NativeSelect>
                            <InputError message={editForm.errors.parent_id} />
                        </div>

                        <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <SlidingDrawerClose asChild>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </SlidingDrawerClose>
                            <Button type="submit" size="sm" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </SlidingDrawerFooter>
                    </form>
                </SlidingDrawerContent>
            </SlidingDrawer>

            <ConfirmActionDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(val) => {
                    if (!val) setDeleteTarget(null);
                }}
                title={deleteTarget ? `Delete "${deleteTarget.name}"?` : 'Delete category?'}
                description="This category will be permanently removed. Make sure all items and sub-categories are moved first."
                confirmLabel={deletingId !== null ? 'Deleting...' : 'Delete Category'}
                processing={deletingId !== null}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

Categories.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: admin.categories().url,
        },
    ],
};
