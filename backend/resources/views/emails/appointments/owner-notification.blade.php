@php
    $timezone = $appointment->barbershop->timezone ?? config('app.timezone', 'Atlantic/Azores');
    $startsAt = $appointment->starts_at?->copy()->timezone($timezone);
    $serviceName = $appointment->service?->name ?? 'Serviço não definido';
    $barberName = $appointment->barber?->name ?? 'Barbeiro não definido';
@endphp
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova marcação</title>
</head>
<body style="margin:0; padding:32px 16px; background:#f4eadb; font-family:Arial, Helvetica, sans-serif; color:#2b2118;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto;">
        <tr>
            <td style="padding-bottom:16px; text-align:center;">
                <span style="display:inline-block; padding:8px 14px; border-radius:999px; background:#a86840; color:#fff7ec; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
                    BarberBook
                </span>
            </td>
        </tr>
        <tr>
            <td style="background:#fff7ec; border:1px solid #d8c3a5; border-radius:24px; overflow:hidden; box-shadow:0 8px 24px rgba(43,33,24,0.08);">
                <div style="background:#2b2118; padding:28px 32px; color:#fff7ec;">
                    <p style="margin:0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,247,236,0.72);">
                        Nova marcação
                    </p>
                    <h1 style="margin:12px 0 0; font-size:30px; line-height:1.2; font-weight:700;">
                        Recebeste uma nova marcação
                    </h1>
                    <p style="margin:12px 0 0; font-size:15px; line-height:1.7; color:rgba(255,247,236,0.78);">
                        A marcação foi registada em {{ $appointment->barbershop->name }}.
                    </p>
                </div>

                <div style="padding:32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0 12px;">
                        @foreach ([
                            'Cliente' => $appointment->client_name,
                            'Telemóvel' => $appointment->client_phone,
                            'E-mail' => $appointment->client_email ?: 'Não indicado',
                            'Data' => $startsAt?->format('d/m/Y'),
                            'Hora' => $startsAt?->format('H:i'),
                            'Serviço' => $serviceName,
                            'Barbeiro' => $barberName,
                        ] as $label => $value)
                            <tr>
                                <td style="width:150px; padding:14px 16px; border-radius:16px; background:#f8e8d3; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8b735b;">
                                    {{ $label }}
                                </td>
                                <td style="padding:14px 16px; border-radius:16px; background:#f8e8d3; font-size:15px; font-weight:600; color:#2b2118;">
                                    {{ $value }}
                                </td>
                            </tr>
                        @endforeach
                    </table>

                    @if ($appointment->notes)
                        <p style="margin:20px 0 0; padding:16px; border-radius:16px; background:#f8e8d3; font-size:15px; line-height:1.7; color:#5b4f3a;">
                            <strong style="color:#2b2118;">Observações:</strong> {{ $appointment->notes }}
                        </p>
                    @endif
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding-top:16px; text-align:center; font-size:12px; line-height:1.7; color:#8b735b;">
                E-mail enviado automaticamente pelo BarberBook.
            </td>
        </tr>
    </table>
</body>
</html>
