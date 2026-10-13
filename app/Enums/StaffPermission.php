<?php

namespace App\Enums;

enum StaffPermission: string
{
    case ProcessDropoffs = 'process dropoffs';
    case ProcessClaims = 'process claims';
    case ProcessReturns = 'process returns';
    case ProcessPayouts = 'process payouts';
    case SubmitDrawerCounts = 'submit drawer counts';

    /**
     * Get all permission values as an array of strings.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
