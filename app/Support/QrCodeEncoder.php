<?php

namespace App\Support;

use BaconQrCode\Renderer\Color\Rgb;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\Fill;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

final class QrCodeEncoder
{
    /**
     * Render a given string as an inline SVG QR code.
     */
    public static function svg(string $data, int $size = 240, int $margin = 1): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size, $margin, null, null, Fill::uniformColor(new Rgb(255, 255, 255), new Rgb(17, 24, 39))),
            new SvgImageBackEnd
        );

        $writer = new Writer($renderer);
        $svg = $writer->writeString($data);

        // Strip xml declaration if present to allow direct inline SVG embedding in HTML/React
        $newlinePos = strpos($svg, "\n");

        if ($newlinePos !== false && str_starts_with($svg, '<?xml')) {
            return trim(substr($svg, $newlinePos + 1));
        }

        return trim($svg);
    }
}
