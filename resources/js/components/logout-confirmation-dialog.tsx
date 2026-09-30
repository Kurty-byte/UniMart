import { useState } from 'react';
import { router } from '@inertiajs/react';
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
import { Spinner } from '@/components/ui/spinner';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';

interface LogoutConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmationDialog({
    open,
    onOpenChange,
}: LogoutConfirmationDialogProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const cleanup = useMobileNavigation();

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        cleanup();
        router.flushAll();
        router.post(logout.url(), {}, {
            onFinish: () => {
                setIsLoggingOut(false);
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => !isLoggingOut && onOpenChange(val)}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log out confirmation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to log out? You will need to sign
                        back in to access your account.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoggingOut}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirmLogout}
                        disabled={isLoggingOut}
                        data-test="confirm-logout-button"
                    >
                        {isLoggingOut && <Spinner />}
                        {isLoggingOut ? 'Logging out...' : 'Log out'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
