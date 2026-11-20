import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { KeyRound, Plus, ShieldCheck, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { PageContainer, PageHeader } from '@/components/page-layout';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import admin from '@/routes/admin';
import type { PaginatedData } from '@/types/admin';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    permissions: string[];
    roles: string[];
    created_at: string | null;
}

interface AdminStaffProps {
    staffMembers: PaginatedData<StaffMember>;
    availablePermissions: string[];
}

const permissionLabels: Record<string, string> = {
    'item.dropoff.approve': 'Approve Item Drop-Offs',
    'item.dropoff.reject': 'Reject Item Drop-Offs',
    'item.return.retrieve': 'Process Expired Item Returns',
    'order.claim.complete': 'Complete Buyer Claims (Cash Intake)',
    'payout.process': 'Process Digital & Cash Payouts',
    'drawer_count.open': 'Open Desk Shifts',
    'drawer_count.close': 'Close Shifts & Submit Drawer Counts',
};

export default function Staff({
    staffMembers,
    availablePermissions = [],
}: AdminStaffProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [permDrawerOpen, setPermDrawerOpen] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<StaffMember | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        permissions: [...availablePermissions],
    });

    const permForm = useForm({
        permissions: [] as string[],
    });

    const toggleCreatePerm = (perm: string) => {
        const has = createForm.data.permissions.includes(perm);
        createForm.setData(
            'permissions',
            has
                ? createForm.data.permissions.filter((p) => p !== perm)
                : [...createForm.data.permissions, perm],
        );
    };

    const toggleEditPerm = (perm: string) => {
        const has = permForm.data.permissions.includes(perm);
        permForm.setData(
            'permissions',
            has
                ? permForm.data.permissions.filter((p) => p !== perm)
                : [...permForm.data.permissions, perm],
        );
    };

    const handleCreateStaff = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(admin.staff.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Staff account created with assigned desk permissions.');
                setCreateOpen(false);
                createForm.reset();
                createForm.setData('permissions', [...availablePermissions]);
            },
            onError: () => toast.error('Please review the staff form fields.'),
        });
    };

    const openEditPermissions = (member: StaffMember) => {
        setEditingStaff(member);
        permForm.setData('permissions', [...member.permissions]);
        permForm.clearErrors();
        setPermDrawerOpen(true);
    };

    const handleSavePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        permForm.put(admin.staff.permissions.update({ user: editingStaff.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Updated operational permissions for ${editingStaff.name}.`);
                setPermDrawerOpen(false);
            },
            onError: () => toast.error('Failed to update staff permissions.'),
        });
    };

    const handleConfirmRevokeStaff = () => {
        if (!revokeTarget) return;
        const member = revokeTarget;
        setRevokingId(member.id);
        router.delete(admin.staff.revoke({ user: member.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Revoked staff access for ${member.name}.`);
                setRevokeTarget(null);
            },
            onError: () => toast.error('Failed to revoke staff access.'),
            onFinish: () => setRevokingId(null),
        });
    };

    return (
        <>
            <Head title="Staff & Permissions - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={ShieldCheck}
                    title="Staff Accounts & Desk Permissions"
                    description="Authorize Campus Hub desk operators and control granular operational permissions per staff member."
                    actions={
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                                createForm.reset();
                                createForm.setData('permissions', [...availablePermissions]);
                                setCreateOpen(true);
                            }}
                            className="gap-1.5"
                        >
                            <Plus className="size-4" />
                            Add Staff Operator
                        </Button>
                    }
                />

                {staffMembers.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <ShieldCheck className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">No staff members yet</h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {staffMembers.data.map((member) => (
                            <div
                                key={member.id}
                                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 hover:bg-muted/20 transition"
                            >
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-primary" />
                                        <span className="font-bold text-sm text-foreground">
                                            {member.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            ({member.email})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {member.permissions.length === 0 ? (
                                            <Badge variant="outline" className="text-[10px]">
                                                Base scanner access only
                                            </Badge>
                                        ) : (
                                            member.permissions.map((perm) => (
                                                <Badge
                                                    key={perm}
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {permissionLabels[perm] ?? perm}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditPermissions(member)}
                                        className="gap-1.5 text-xs"
                                    >
                                        <KeyRound className="size-3.5" />
                                        Permissions
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={revokingId === member.id}
                                        onClick={() => setRevokeTarget(member)}
                                        className="gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Revoke
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {staffMembers.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {staffMembers.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={staffMembers.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {staffMembers.current_page} of {staffMembers.last_page}
                        </span>
                        {staffMembers.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={staffMembers.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            {/* Create Staff Drawer */}
            <SlidingDrawer open={createOpen} onOpenChange={setCreateOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="lg">
                    <SlidingDrawerHeader
                        icon={Plus}
                        title="Create Staff Operator"
                        description="Provision a new Campus Hub staff account and grant operational desk privileges."
                    />
                    <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_name" className="text-xs font-semibold">
                                Full Name *
                            </Label>
                            <Input
                                id="staff_name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="staff_email" className="text-xs font-semibold">
                                Email Address *
                            </Label>
                            <Input
                                id="staff_email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.email} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="staff_password" className="text-xs font-semibold">
                                    Password *
                                </Label>
                                <PasswordInput
                                    id="staff_password"
                                    value={createForm.data.password}
                                    onChange={(e) =>
                                        createForm.setData('password', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={createForm.errors.password} />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="staff_password_confirmation"
                                    className="text-xs font-semibold"
                                >
                                    Confirm Password *
                                </Label>
                                <PasswordInput
                                    id="staff_password_confirmation"
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-border pt-3">
                            <Label className="text-xs font-semibold">Operational Permissions</Label>
                            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                                {availablePermissions.map((perm) => (
                                    <label
                                        key={perm}
                                        className="flex items-center gap-2.5 text-xs cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={createForm.data.permissions.includes(perm)}
                                            onCheckedChange={() => toggleCreatePerm(perm)}
                                        />
                                        <span>{permissionLabels[perm] ?? perm}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={createForm.errors.permissions} />
                        </div>

                        <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <SlidingDrawerClose asChild>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </SlidingDrawerClose>
                            <Button type="submit" size="sm" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create Staff Account'}
                            </Button>
                        </SlidingDrawerFooter>
                    </form>
                </SlidingDrawerContent>
            </SlidingDrawer>

            {/* Edit Staff Permissions Drawer */}
            <SlidingDrawer open={permDrawerOpen} onOpenChange={setPermDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="md">
                    {editingStaff && (
                        <>
                            <SlidingDrawerHeader
                                icon={KeyRound}
                                title={`Permissions — ${editingStaff.name}`}
                                description="Changes take effect immediately on the staff operator's next desk action."
                            />
                            <form onSubmit={handleSavePermissions} className="mt-4 space-y-4">
                                <div className="space-y-2.5 rounded-xl border border-border bg-muted/20 p-4">
                                    {availablePermissions.map((perm) => (
                                        <label
                                            key={perm}
                                            className="flex items-center gap-2.5 text-xs cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={permForm.data.permissions.includes(perm)}
                                                onCheckedChange={() => toggleEditPerm(perm)}
                                            />
                                            <span className="font-medium text-foreground">
                                                {permissionLabels[perm] ?? perm}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                    <SlidingDrawerClose asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            Cancel
                                        </Button>
                                    </SlidingDrawerClose>
                                    <Button type="submit" size="sm" disabled={permForm.processing}>
                                        {permForm.processing ? 'Saving...' : 'Update Permissions'}
                                    </Button>
                                </SlidingDrawerFooter>
                            </form>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>

            <ConfirmActionDialog
                open={Boolean(revokeTarget)}
                onOpenChange={(val) => {
                    if (!val) setRevokeTarget(null);
                }}
                title={revokeTarget ? `Revoke staff access for ${revokeTarget.name}?` : 'Revoke staff access?'}
                description="This will immediately remove their Staff role and all Campus Hub desk permissions."
                confirmLabel={revokingId !== null ? 'Revoking...' : 'Revoke Access'}
                processing={revokingId !== null}
                onConfirm={handleConfirmRevokeStaff}
            />
        </>
    );
}

Staff.layout = {
    breadcrumbs: [
        {
            title: 'Staff & Permissions',
            href: admin.staff.index().url,
        },
    ],
};
