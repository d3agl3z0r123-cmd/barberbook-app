<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Services\BarbershopQrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BarbershopQrCodeController extends Controller
{
    public function __construct(private readonly BarbershopQrCodeService $qrCodes)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Ainda não tens nenhuma barbearia criada.',
            ], 404);
        }

        $barbershop = $this->qrCodes->ensure($barbershop);

        return response()->json([
            'qr_code' => $this->qrCodes->formatPayload($barbershop),
        ]);
    }

    public function regenerate(Request $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Ainda não tens nenhuma barbearia criada.',
            ], 404);
        }

        $barbershop = $this->qrCodes->regenerate($barbershop);

        return response()->json([
            'message' => 'QR Code gerado com sucesso.',
            'qr_code' => $this->qrCodes->formatPayload($barbershop),
        ]);
    }

    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Ainda não tens nenhuma barbearia criada.',
            ], 404);
        }

        $barbershop = $this->qrCodes->ensure($barbershop);
        $svg = $this->qrCodes->svgContents($barbershop);

        if (! $svg) {
            return response()->json([
                'message' => 'Não foi possível preparar o QR Code para descarga.',
            ], 422);
        }

        return response()->streamDownload(
            fn () => print($svg),
            "barberpro-qr-{$barbershop->slug}.svg",
            ['Content-Type' => 'image/svg+xml']
        );
    }

    public function pdf(Request $request): JsonResponse
    {
        if (! $request->user()?->barbershop) {
            return response()->json([
                'message' => 'Ainda não tens nenhuma barbearia criada.',
            ], 404);
        }

        return response()->json([
            'message' => 'Exportação em PDF preparada para a versão premium.',
            'status' => 'planned',
        ], 501);
    }
}
