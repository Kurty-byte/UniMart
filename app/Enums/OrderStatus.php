<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Cart = 'cart';
    case PendingHandover = 'pending_handover';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
}
