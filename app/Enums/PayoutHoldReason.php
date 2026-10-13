<?php

namespace App\Enums;

enum PayoutHoldReason: string
{
    case FixedAmountQr = 'fixed_amount_qr';
    case UnreadableQr = 'unreadable_qr';
    case InsufficientDigitalFunds = 'insufficient_digital_funds';
    case SellerRequest = 'seller_request';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::FixedAmountQr => 'QR code contains a locked/fixed amount',
            self::UnreadableQr => 'QR code cannot be scanned or read',
            self::InsufficientDigitalFunds => 'Hub desk currently lacks digital funds',
            self::SellerRequest => 'Seller requested physical cash payout',
            self::Other => 'Other operational reason',
        };
    }
}
