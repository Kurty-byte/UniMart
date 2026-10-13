<?php

namespace App\Support;

class EmvcoQrValidator
{
    /**
     * Parse an EMVCo QR string into an associative array of tag => value.
     *
     * @return array<string, string>
     */
    public static function parse(string $payload): array
    {
        $tags = [];
        $length = strlen($payload);
        $offset = 0;

        while ($offset + 4 <= $length) {
            $tag = substr($payload, $offset, 2);
            $lenStr = substr($payload, $offset + 2, 2);

            if (! ctype_digit($lenStr)) {
                break;
            }

            $tagLen = (int) $lenStr;
            $offset += 4;

            if ($offset + $tagLen > $length) {
                break;
            }

            $val = substr($payload, $offset, $tagLen);
            $tags[$tag] = $val;
            $offset += $tagLen;
        }

        return $tags;
    }

    /**
     * Validate an EMVCo payload string.
     * Returns an error message if invalid, or null if valid.
     */
    public static function validate(string $payload): ?string
    {
        $payload = trim($payload);
        if ($payload === '') {
            return null;
        }

        $tags = self::parse($payload);

        // If not a recognized EMVCo payload (e.g. custom link or plain ID), pass through
        if (! isset($tags['00']) || $tags['00'] !== '01') {
            return null;
        }

        // Tag 54: Transaction Amount
        if (isset($tags['54'])) {
            $amount = $tags['54'];

            return "The uploaded QR code contains a fixed amount of ₱{$amount}. Please upload a personal 'Receive Money' QR without an amount.";
        }

        // Tag 01: Point of Initiation Method ('11' = Static, '12' = Dynamic)
        if (isset($tags['01']) && $tags['01'] === '12') {
            return 'This is a dynamic single-use QR code. Please upload a static, reusable personal QR code.';
        }

        return null;
    }
}
