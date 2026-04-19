@php
    $timezone = $appointment->barbershop->timezone ?? config('app.timezone', 'Atlantic/Azores');
    $startsAt = $appointment->starts_at?->copy()->timezone($timezone);
    $serviceName = $appointment->service?->name ?? 'Serviço a confirmar na unidade';
@endphp
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Marcação confirmada</title>
</head>
<body style="margin:0; padding:32px 16px; background:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#171717;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto;">
        <tr>
            <td style="padding-bottom:16px; text-align:center;">
                <span style="display:inline-block; padding:8px 14px; border-radius:999px; background:#171717; color:#ffffff; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
                    BarberPro
                </span>
            </td>
        </tr>
        <tr>
            <td style="background:#ffffff; border:1px solid #e5e5e5; border-radius:24px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.04);">
                <div style="background:#171717; padding:28px 32px; color:#ffffff;">
                    <p style="margin:0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.68);">
                        Confirmação de marcação
                    </p>
                    <h1 style="margin:12px 0 0; font-size:30px; line-height:1.2; font-weight:700;">
                        A tua marcação está confirmada
                    </h1>
                    <p style="margin:12px 0 0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.76);">
                        Olá {{ $appointment->client_name }}, já deixámos tudo registado para o teu atendimento.
                    </p>
                </div>

                <div style="padding:32px;">
                    <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#525252;">
                        Aqui ficam os detalhes principais da tua marcação na
                        <strong style="color:#171717;">{{ $appointment->barbershop->name }}</strong>.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate; border-spacing:0 12px;">
                        <tr>
                            <td style="width:160px; padding:16px; border-radius:18px; background:#fafafa; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#737373;">
                                Data
                            </td>
                            <td style="padding:16px; border-radius:18px; background:#fafafa; font-size:16px; font-weight:600; color:#171717;">
                                {{ $startsAt?->format('d/m/Y') }}
                            </td>
                        </tr>
                        <tr>
                            <td style="width:160px; padding:16px; border-radius:18px; background:#fafafa; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#737373;">
                                Hora
                            </td>
                            <td style="padding:16px; border-radius:18px; background:#fafafa; font-size:16px; font-weight:600; color:#171717;">
                                {{ $startsAt?->format('H:i') }}
                            </td>
                        </tr>
                        <tr>
                            <td style="width:160px; padding:16px; border-radius:18px; background:#fafafa; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#737373;">
                                Barbearia
                            </td>
                            <td style="padding:16px; border-radius:18px; background:#fafafa; font-size:16px; font-weight:600; color:#171717;">
                                {{ $appointment->barbershop->name }}
                            </td>
                        </tr>
                        <tr>
                            <td style="width:160px; padding:16px; border-radius:18px; background:#fafafa; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#737373;">
                                Serviço
                            </td>
                            <td style="padding:16px; border-radius:18px; background:#fafafa; font-size:16px; font-weight:600; color:#171717;">
                                {{ $serviceName }}
                            </td>
                        </tr>
                    </table>

                    <p style="margin:24px 0 0; font-size:15px; line-height:1.7; color:#525252;">
                        Obrigado por escolheres a <strong style="color:#171717;">{{ $appointment->barbershop->name }}</strong>.
                        Se precisares de ajustar a tua marcação, entra em contacto com a barbearia.
                    </p>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding-top:16px; text-align:center; font-size:12px; line-height:1.7; color:#737373;">
                E-mail enviado automaticamente pelo BarberPro.
            </td>
        </tr>
    </table>
</body>
</html>
