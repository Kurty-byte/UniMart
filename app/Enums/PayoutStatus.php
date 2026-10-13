<?php

namespace App\Enums;

enum PayoutStatus: string
{
    case Pending = 'pending';
    case PaidDigitally = 'paid_digitally';
    case CashHeld = 'cash_held';
    case CashClaimed = 'cash_claimed';
}
