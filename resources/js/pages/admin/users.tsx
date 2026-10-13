import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Edit2,
    Eye,
    KeyRound,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    Users as UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import admin from '@/routes/admin';
import type { ManagedUser, PaginatedData } from '@/types/admin';

interface UsersPageProps {
    users: PaginatedData<ManagedUser>;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

export default function Users({ users, filters }: UsersPageProps) {
    const isMobile = useIsMobile();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<ManagedUser | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleViewUser = (user: ManagedUser) => {
        setViewingUser(user);
        setIsViewOpen(true);
    };

    const handleEditUser = (user: ManagedUser) => {
        setEditingUser(user);
        setIsEditOpen(true);
    };

    const handleDeleteUser = (user: ManagedUser) => {
        setDeletingUser(user);
        setIsDeleteOpen(true);
    };

    // Apply filters
    const applyFilters = (newSearch: string, newRole: string, newStatus: string) => {
        router.get(
            admin.users().url,
            {
                search: newSearch || undefined,
                role: newRole !== 'all' ? newRole : undefined,
                status: newStatus !== 'all' ? newStatus : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, selectedRole, selectedStatus);
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        applyFilters(search, value, selectedStatus);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        applyFilters(search, selectedRole, value);
    };

    // Quick suspend / unsuspend
    const toggleSuspend = (user: ManagedUser) => {
        const actionRoute = user.is_suspended
            ? admin.users.unsuspend({ user: user.id }).url
            : admin.users.suspend({ user: user.id }).url;

        router.post(
            actionRoute,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        user.is_suspended
                            ? `User ${user.name} has been unsuspended.`
                            : `User ${user.name} has been suspended.`
                    );
                    setViewingUser((current) =>
                        current && current.id === user.id
                            ? {
                                  ...current,
                                  is_suspended: !current.is_suspended,
                                  suspended_at: current.is_suspended ? null : new Date().toISOString(),
                              }
                            : current
                    );
                },
                onError: () => {
                    toast.error('Failed to change user suspension status.');
                },
            }
        );
    };

    return (
        <>
            <Head title="Users Management" />
            <div className="flex h-full flex-1 flex-col gap-5 p-3 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <UsersIcon className="size-5 sm:size-6 text-primary" />
                            Users
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Manage user accounts, roles, access permissions, and passwords.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2 shrink-0 w-full sm:w-auto h-9 sm:h-10 text-sm"
                    >
                        <Plus className="size-4" />
                        Add User
                    </Button>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 w-full text-xs sm:text-sm"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 shrink-0 text-xs sm:text-sm">
                            Search
                        </Button>
                    </form>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                        <div className="col-span-1 sm:w-36">
                            <Select value={selectedRole} onValueChange={handleRoleChange}>
                                <SelectTrigger className="h-9 w-full text-xs sm:text-sm">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-1 sm:w-36">
                            <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 w-full text-xs sm:text-sm">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(search || selectedRole !== 'all' || selectedStatus !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setSelectedRole('all');
                                    setSelectedStatus('all');
                                    applyFilters('', 'all', 'all');
                                }}
                                className="col-span-2 sm:col-span-1 h-9 text-xs"
                            >
                                Reset filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Users Container */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                    {/* Mobile Card-Based View (< md) */}
                    <div className="md:hidden divide-y divide-border">
                        {users.data.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <UsersIcon className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-base font-medium">No users found</p>
                                <p className="text-xs">Try adjusting your search terms or filters.</p>
                            </div>
                        ) : (
                            users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleViewUser(user)}
                                        className="text-left font-medium text-sm text-foreground hover:text-primary transition-colors truncate pr-3 flex-1 cursor-pointer"
                                    >
                                        {user.name}
                                    </button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 shrink-0">
                                                <MoreHorizontal className="size-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                onClick={() => handleViewUser(user)}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <Eye className="size-4" />
                                                View User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleEditUser(user)}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <Edit2 className="size-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => toggleSuspend(user)}
                                                className={`gap-2 cursor-pointer ${
                                                    user.is_suspended ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                                }`}
                                            >
                                                {user.is_suspended ? (
                                                    <>
                                                        <UserCheck className="size-4" />
                                                        Unsuspend Account
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="size-4" />
                                                        Suspend Account
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteUser(user)}
                                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                            >
                                                <Trash2 className="size-4" />
                                                Delete Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Full Table View (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider border-b">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5 font-medium">User</th>
                                    <th scope="col" className="px-6 py-3.5 font-medium">Role</th>
                                    <th scope="col" className="px-6 py-3.5 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3.5 font-medium">Activity</th>
                                    <th scope="col" className="px-6 py-3.5 font-medium">Joined</th>
                                    <th scope="col" className="px-6 py-3.5 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UsersIcon className="size-8 text-muted-foreground/50" />
                                                <p className="text-base font-medium">No users found</p>
                                                <p className="text-xs">Try adjusting your search terms or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewUser(user)}
                                                        className="text-left font-semibold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer"
                                                    >
                                                        {user.name}
                                                    </button>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant={
                                                                role === 'admin'
                                                                    ? 'destructive'
                                                                    : role === 'staff'
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                            className="capitalize text-[11px] font-medium"
                                                        >
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.is_suspended ? (
                                                    <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 gap-1 text-[11px]">
                                                        <Ban className="size-3" />
                                                        Suspended
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1 text-[11px]">
                                                        <CheckCircle2 className="size-3" />
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>{user.items_count} {user.items_count === 1 ? 'item' : 'items'} listed</span>
                                                    {user.reports_count > 0 && (
                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                            {user.reports_count} {user.reports_count === 1 ? 'report' : 'reports'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewUser(user)}
                                                        className="h-8 px-2 text-xs gap-1"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        View
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditUser(user)}
                                                        className="h-8 px-2 text-xs gap-1"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                        Edit
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreHorizontal className="size-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => handleViewUser(user)} className="gap-2 cursor-pointer">
                                                                <Eye className="size-4" />
                                                                View User Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="gap-2 cursor-pointer">
                                                                <KeyRound className="size-4" />
                                                                Modify Details / Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => toggleSuspend(user)}
                                                                className={`gap-2 cursor-pointer ${
                                                                    user.is_suspended ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                                                }`}
                                                            >
                                                                {user.is_suspended ? (
                                                                    <>
                                                                        <UserCheck className="size-4" />
                                                                        Unsuspend Account
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Ban className="size-4" />
                                                                        Suspend Account
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Delete Account
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Shadcn UI Pagination */}
                    {users.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t text-xs text-muted-foreground">
                            <div className="text-center sm:text-left">
                                Showing <span className="font-medium text-foreground">{users.from || 0}</span> to{' '}
                                <span className="font-medium text-foreground">{users.to || 0}</span> of{' '}
                                <span className="font-medium text-foreground">{users.total}</span> users
                            </div>

                            <Pagination className="mx-0 w-auto justify-center sm:justify-end">
                                <PaginationContent className="flex-wrap justify-center gap-1">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={users.prev_page_url || '#'}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (users.prev_page_url) {
                                                    router.get(users.prev_page_url, {}, { preserveScroll: true, preserveState: true });
                                                }
                                            }}
                                            className={!users.prev_page_url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {users.links.slice(1, -1).map((link, index) => {
                                        if (link.label === '...') {
                                            return (
                                                <PaginationItem key={`ellipsis-${index}`} className="hidden sm:inline-block">
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        const pageNum = parseInt(link.label, 10);
                                        const isNearActive = !isNaN(pageNum) && Math.abs(pageNum - users.current_page) <= 1;
                                        const hideOnMobile = !link.active && !isNearActive;

                                        return (
                                            <PaginationItem key={link.label} className={hideOnMobile ? 'hidden sm:inline-block' : ''}>
                                                <PaginationLink
                                                    href={link.url || '#'}
                                                    isActive={link.active}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (link.url && !link.active) {
                                                            router.get(link.url, {}, { preserveScroll: true, preserveState: true });
                                                        }
                                                    }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={users.next_page_url || '#'}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (users.next_page_url) {
                                                    router.get(users.next_page_url, {}, { preserveScroll: true, preserveState: true });
                                                }
                                            }}
                                            className={!users.next_page_url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            {/* View User Details Sheet (Web) / Bottom Drawer (Mobile) */}
            <UserDetailSheet
                user={viewingUser}
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                onEdit={handleEditUser}
                onToggleSuspend={toggleSuspend}
                onDelete={handleDeleteUser}
            />

            {/* Create User Dialog */}
            <CreateUserDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            {/* Edit User Dialog (Web) / Bottom Drawer (Mobile) */}
            <EditUserDialog
                user={editingUser}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            {/* Delete User Dialog */}
            <DeleteUserDialog
                user={deletingUser}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
            />
        </>
    );
}

Users.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: admin.users().url,
        },
    ],
};

/* --- Modals & Subcomponents --- */

interface UserDetailSheetProps {
    user: ManagedUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (user: ManagedUser) => void;
    onToggleSuspend: (user: ManagedUser) => void;
    onDelete: (user: ManagedUser) => void;
}

function getInitials(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U'
    );
}

function UserDetailSheet({
    user,
    open,
    onOpenChange,
    onEdit,
    onToggleSuspend,
    onDelete,
}: UserDetailSheetProps) {
    const isMobile = useIsMobile();
    const [cachedUser, setCachedUser] = useState<ManagedUser | null>(user);

    useEffect(() => {
        if (user) {
            setCachedUser(user);
        }
    }, [user]);

    const activeUser = user || cachedUser;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={
                    isMobile
                        ? 'rounded-t-2xl max-h-[85vh] overflow-y-auto px-5 py-6 pb-10 border-t space-y-6'
                        : 'sm:max-w-md overflow-y-auto p-6 space-y-6 border-l'
                }
            >
                {activeUser && (
                    <>
                        {isMobile && (
                            <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/20 -mt-2 mb-2" />
                        )}

                        <SheetHeader className="p-0 text-left space-y-1">
                            <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                                <UsersIcon className="size-5 text-primary" />
                                User Details
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Account information, role assignments, and hub activity.
                            </SheetDescription>
                        </SheetHeader>

                        {/* Profile Header */}
                        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                            <Avatar className="size-12 border bg-primary/10 text-primary font-semibold text-base">
                                <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base text-foreground truncate">{activeUser.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{activeUser.email}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    {activeUser.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant={
                                                role === 'admin'
                                                    ? 'destructive'
                                                    : role === 'staff'
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                            className="capitalize text-[10px] px-1.5 py-0 font-medium"
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                    {activeUser.is_suspended ? (
                                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] px-1.5 py-0">
                                            Suspended
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] px-1.5 py-0">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Account Information
                            </h4>
                            <div className="rounded-xl border divide-y text-xs">
                                <div className="flex items-center justify-between p-3">
                                    <span className="text-muted-foreground">User ID</span>
                                    <span className="font-mono font-medium">#{activeUser.id}</span>
                                </div>
                                <div className="flex items-center justify-between p-3">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium">
                                        {activeUser.is_suspended
                                            ? `Suspended ${activeUser.suspended_at ? '(' + new Date(activeUser.suspended_at).toLocaleDateString() + ')' : ''}`
                                            : 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3">
                                    <span className="text-muted-foreground">Registered</span>
                                    <span className="font-medium">
                                        {activeUser.created_at ? new Date(activeUser.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Statistics */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Marketplace Activity
                            </h4>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-xl border bg-card">
                                    <div className="text-[11px] text-muted-foreground">Items Listed</div>
                                    <div className="text-xl font-bold mt-0.5 text-foreground">{activeUser.items_count}</div>
                                </div>
                                <div className="p-3 rounded-xl border bg-card">
                                    <div className="text-[11px] text-muted-foreground">Reports Received</div>
                                    <div className={`text-xl font-bold mt-0.5 ${activeUser.reports_count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                        {activeUser.reports_count}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Administrative Quick Actions */}
                        <div className="space-y-2 pt-2 border-t">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                Administrative Actions
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 h-9 text-xs"
                                    onClick={() => {
                                        onOpenChange(false);
                                        onEdit(activeUser);
                                    }}
                                >
                                    <Edit2 className="size-3.5 text-primary" />
                                    Edit Details / Password
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start gap-2 h-9 text-xs ${
                                        activeUser.is_suspended ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700' : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                                    }`}
                                    onClick={() => {
                                        onToggleSuspend(activeUser);
                                    }}
                                >
                                    {activeUser.is_suspended ? (
                                        <>
                                            <UserCheck className="size-3.5" />
                                            Unsuspend Account
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="size-3.5" />
                                            Suspend Account
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    onOpenChange(false);
                                    onDelete(activeUser);
                                }}
                            >
                                <Trash2 className="size-3.5" />
                                Delete Account
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'student',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.users.store().url, {
            onSuccess: () => {
                toast.success('User account created successfully.');
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Please check the form for errors.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Plus className="size-5 text-primary" />
                        Create New User
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Create an account and assign a role with immediate verification.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="create-name" className="text-xs sm:text-sm">Full Name</Label>
                        <Input
                            id="create-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. John Doe"
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="create-email" className="text-xs sm:text-sm">Email Address</Label>
                        <Input
                            id="create-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="john@university.edu.ph"
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="create-role" className="text-xs sm:text-sm">System Role</Label>
                        <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                            <SelectTrigger id="create-role" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student (Marketplace Buyer & Seller)</SelectItem>
                                <SelectItem value="staff">Staff (Counter Operations)</SelectItem>
                                <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="create-password" className="text-xs sm:text-sm">Password</Label>
                        <PasswordInput
                            id="create-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="create-password-confirmation" className="text-xs sm:text-sm">Confirm Password</Label>
                        <PasswordInput
                            id="create-password-confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Re-type password"
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                            required
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto gap-1.5 h-9 sm:h-10 text-xs sm:text-sm">
                            {processing && <Spinner />}
                            Create Account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface EditUserDialogProps {
    user: ManagedUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
    const isMobile = useIsMobile();
    const [cachedUser, setCachedUser] = useState<ManagedUser | null>(user);

    useEffect(() => {
        if (user) {
            setCachedUser(user);
        }
    }, [user]);

    const activeUser = user || cachedUser;

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-h-[90vh] overflow-y-auto px-5 py-6 pb-10 border-t"
                >
                    <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/20 -mt-2 mb-3" />
                    <SheetHeader className="p-0 text-left mb-4">
                        <SheetTitle className="flex items-center gap-2 text-lg">
                            <Edit2 className="size-5 text-primary" />
                            Edit User
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Modify name, email, role, or reset password for this user.
                        </SheetDescription>
                    </SheetHeader>

                    {activeUser && (
                        <EditUserForm
                            user={activeUser}
                            onSuccess={() => onOpenChange(false)}
                            onCancel={() => onOpenChange(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Edit2 className="size-5 text-primary" />
                        Edit User
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Modify name, email, role, or reset password for this user.
                    </DialogDescription>
                </DialogHeader>

                {activeUser && (
                    <EditUserForm
                        user={activeUser}
                        onSuccess={() => onOpenChange(false)}
                        onCancel={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface EditUserFormProps {
    user: ManagedUser;
    onSuccess: () => void;
    onCancel: () => void;
}

function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        role: user.roles[0] || 'student',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setData({
            name: user.name,
            email: user.email,
            role: user.roles[0] || 'student',
            password: '',
            password_confirmation: '',
        });
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.users.update({ user: user.id }).url, {
            onSuccess: () => {
                toast.success(`User ${data.name} updated successfully.`);
                reset();
                onSuccess();
            },
            onError: (err) => {
                if (err.role) {
                    toast.error(err.role);
                } else {
                    toast.error('Please check the form for errors.');
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs sm:text-sm">Full Name</Label>
                <Input
                    id="edit-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs sm:text-sm">Email Address</Label>
                <Input
                    id="edit-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                />
                <InputError message={errors.email} />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-xs sm:text-sm">System Role</Label>
                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                    <SelectTrigger id="edit-role" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="student">Student (Marketplace)</SelectItem>
                        <SelectItem value="staff">Staff (Desk Operations)</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.role} />
            </div>

            <div className="border-t pt-3 space-y-3">
                <div className="space-y-0.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="size-3.5" />
                        Password Reset (Optional)
                    </Label>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Leave blank to keep the current password.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="edit-password" className="text-xs sm:text-sm">New Password</Label>
                    <PasswordInput
                        id="edit-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter new password (optional)"
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="edit-password-confirmation" className="text-xs sm:text-sm">Confirm New Password</Label>
                    <PasswordInput
                        id="edit-password-confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Re-type new password"
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing}
                    onClick={onCancel}
                    className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-auto gap-1.5 h-9 sm:h-10 text-xs sm:text-sm"
                >
                    {processing && <Spinner />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

interface DeleteUserDialogProps {
    user: ManagedUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
    const [cachedUser, setCachedUser] = useState<ManagedUser | null>(user);

    useEffect(() => {
        if (user) {
            setCachedUser(user);
        }
    }, [user]);

    const activeUser = user || cachedUser;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!activeUser) return;
        setIsDeleting(true);
        router.delete(admin.users.destroy({ user: activeUser.id }).url, {
            onSuccess: () => {
                setIsDeleting(false);
                toast.success(`User ${activeUser.name} has been deleted.`);
                onOpenChange(false);
            },
            onError: (errors) => {
                setIsDeleting(false);
                if (errors.user) {
                    toast.error(errors.user);
                } else {
                    toast.error('Could not delete user account.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
                        <Shield className="size-5" />
                        Confirm Account Deletion
                    </DialogTitle>
                    <DialogDescription className="space-y-2 pt-2 text-left text-xs sm:text-sm">
                        {activeUser && (
                            <p>
                                Are you sure you want to permanently delete{' '}
                                <strong className="text-foreground">{activeUser.name}</strong> ({activeUser.email})?
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground bg-muted p-2.5 rounded-lg border">
                            <strong>Note:</strong> Accounts with active or historical marketplace transactions
                            (items, orders, or cash desk drawer counts) cannot be deleted to preserve audit trails.
                            Consider suspending the account instead if they have history.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isDeleting} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || !activeUser}
                        className="w-full sm:w-auto gap-1.5 h-9 sm:h-10 text-xs sm:text-sm"
                    >
                        {isDeleting && <Spinner />}
                        Delete User Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
