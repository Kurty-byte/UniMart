<?php

namespace App\Enums;

enum HubEvent: string
{
    case DropoffApproved = 'dropoff_approved';
    case DropoffRejected = 'dropoff_rejected';
    case ClaimCompleted = 'claim_completed';
    case PayoutDisbursedDigitally = 'payout_disbursed_digitally';
    case PayoutHeldForCash = 'payout_held_for_cash';
    case CashPayoutReleased = 'cash_payout_released';
    case ItemRetrieved = 'item_retrieved';
    case ItemExpired = 'item_expired';
    case ItemTakenDown = 'item_taken_down';
    case ShiftOpened = 'shift_opened';
    case ShiftClosed = 'shift_closed';
    case UserSuspended = 'user_suspended';
    case UserUnsuspended = 'user_unsuspended';
    case StaffAccountCreated = 'staff_account_created';
    case StaffPermissionsUpdated = 'staff_permissions_updated';
    case StaffRoleRevoked = 'staff_role_revoked';
    case SettingsUpdated = 'settings_updated';
    case ReportResolved = 'report_resolved';

    /**
     * Get a human-readable description for the activity log.
     */
    public function description(): string
    {
        return match ($this) {
            self::DropoffApproved => 'Approved item drop-off',
            self::DropoffRejected => 'Rejected item drop-off',
            self::ClaimCompleted => 'Completed order handover claim',
            self::PayoutDisbursedDigitally => 'Disbursed digital payout to seller e-wallet',
            self::PayoutHeldForCash => 'Held item payout for cash collection at hub',
            self::CashPayoutReleased => 'Released cash payout to seller',
            self::ItemRetrieved => 'Item retrieved by original owner',
            self::ItemExpired => 'Item expired after shelf-life duration',
            self::ItemTakenDown => 'Item taken down by administrator',
            self::ShiftOpened => 'Staff shift opened',
            self::ShiftClosed => 'Staff shift closed with drawer reconciliation',
            self::UserSuspended => 'User suspended by administrator',
            self::UserUnsuspended => 'User unsuspended by administrator',
            self::StaffAccountCreated => 'Staff account created',
            self::StaffPermissionsUpdated => 'Staff permissions updated',
            self::StaffRoleRevoked => 'Staff role revoked',
            self::SettingsUpdated => 'System settings updated',
            self::ReportResolved => 'Report resolved by administrator',
        };
    }
}
