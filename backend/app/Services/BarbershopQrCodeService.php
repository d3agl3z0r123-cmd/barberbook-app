<?php

namespace App\Services;

use App\Models\Barbershop;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Support\Facades\Storage;

class BarbershopQrCodeService
{
    private const DISK = 'public';
    private const SIZE = 420;
    private const MARGIN = 18;

    public function ensure(Barbershop $barbershop): Barbershop
    {
        if ($this->needsGeneration($barbershop)) {
            return $this->regenerate($barbershop);
        }

        return $barbershop->fresh() ?? $barbershop;
    }

    public function regenerate(Barbershop $barbershop): Barbershop
    {
        $publicUrl = $this->publicUrl($barbershop);
        $path = $this->storagePath($barbershop);

        $result = (new Builder(
            writer: new SvgWriter(),
            writerOptions: [
                SvgWriter::WRITER_OPTION_COMPACT => true,
            ],
            data: $publicUrl,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: self::SIZE,
            margin: self::MARGIN,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(10, 10, 10),
            backgroundColor: new Color(255, 255, 255),
        ))->build();

        Storage::disk(self::DISK)->put($path, $result->getString());

        $now = now();
        $barbershop->forceFill([
            'qr_path' => $path,
            'qr_url' => $publicUrl,
            'qr_generated_at' => $barbershop->qr_generated_at ?? $now,
            'qr_last_regenerated_at' => $now,
            'qr_metadata' => [
                'format' => 'svg',
                'size' => self::SIZE,
                'margin' => self::MARGIN,
                'target' => 'public_booking',
                'error_correction' => 'high',
                'scan_tracking_ready' => true,
                'scan_summary_fields' => [
                    'qr_scan_count',
                    'qr_last_scanned_at',
                ],
                'custom_logo_ready' => true,
                'branding_slots' => [
                    'logo_path',
                    'foreground_color',
                    'background_color',
                ],
                'pdf_export_ready' => true,
                'pdf_export_endpoint' => '/api/barbershop/qr-code/pdf',
            ],
        ])->save();

        return $barbershop->fresh() ?? $barbershop;
    }

    public function publicUrl(Barbershop $barbershop): string
    {
        return rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/').'/book/'.$barbershop->slug;
    }

    public function dataUri(Barbershop $barbershop): ?string
    {
        if (! $barbershop->qr_path || ! Storage::disk(self::DISK)->exists($barbershop->qr_path)) {
            return null;
        }

        return 'data:image/svg+xml;base64,'.base64_encode(Storage::disk(self::DISK)->get($barbershop->qr_path));
    }

    public function svgContents(Barbershop $barbershop): ?string
    {
        if (! $barbershop->qr_path || ! Storage::disk(self::DISK)->exists($barbershop->qr_path)) {
            return null;
        }

        return Storage::disk(self::DISK)->get($barbershop->qr_path);
    }

    public function formatPayload(Barbershop $barbershop): array
    {
        return [
            'public_url' => $barbershop->qr_url ?: $this->publicUrl($barbershop),
            'qr_url' => $barbershop->qr_url,
            'qr_path' => $barbershop->qr_path,
            'qr_data_uri' => $this->dataUri($barbershop),
            'qr_generated_at' => $barbershop->qr_generated_at,
            'qr_last_regenerated_at' => $barbershop->qr_last_regenerated_at,
            'qr_scan_count' => $barbershop->qr_scan_count ?? 0,
            'qr_last_scanned_at' => $barbershop->qr_last_scanned_at,
            'qr_metadata' => $barbershop->qr_metadata,
            'premium_ready' => [
                'scan_tracking' => true,
                'custom_logo' => true,
                'pdf_export' => true,
            ],
        ];
    }

    private function needsGeneration(Barbershop $barbershop): bool
    {
        return ! $barbershop->qr_path
            || ! $barbershop->qr_url
            || $barbershop->qr_url !== $this->publicUrl($barbershop)
            || ! Storage::disk(self::DISK)->exists($barbershop->qr_path);
    }

    private function storagePath(Barbershop $barbershop): string
    {
        return "qrcodes/barbershops/{$barbershop->id}/{$barbershop->slug}.svg";
    }
}
