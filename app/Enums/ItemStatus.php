<?php

namespace App\Enums;

enum ItemStatus: string
{
    case PendingDropoff = 'pending_dropoff';
    case Available = 'available';
    case Sold = 'sold';
    case Expired = 'expired';
    case Retrieved = 'retrieved';
    case Rejected = 'rejected';
}
