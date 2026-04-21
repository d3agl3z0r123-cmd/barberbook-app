<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Barbershop;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use RuntimeException;
use ZipArchive;

class AppointmentExcelExportService
{
    /**
     * @param Collection<int, Appointment> $appointments
     */
    public function export(Barbershop $barbershop, Collection $appointments): string
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('A extensão ZipArchive é necessária para exportar Excel.');
        }

        $path = tempnam(sys_get_temp_dir(), 'barberbook-agenda-');

        if ($path === false) {
            throw new RuntimeException('Não foi possível criar o ficheiro temporário.');
        }

        $xlsxPath = $path.'.xlsx';
        rename($path, $xlsxPath);

        $zip = new ZipArchive();

        if ($zip->open($xlsxPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Não foi possível criar o ficheiro Excel.');
        }

        $zip->addFromString('[Content_Types].xml', $this->contentTypesXml());
        $zip->addFromString('_rels/.rels', $this->relsXml());
        $zip->addFromString('xl/workbook.xml', $this->workbookXml());
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRelsXml());
        $zip->addFromString('xl/styles.xml', $this->stylesXml());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheetXml($barbershop, $appointments));
        $zip->close();

        return $xlsxPath;
    }

    /**
     * @param Collection<int, Appointment> $appointments
     */
    private function sheetXml(Barbershop $barbershop, Collection $appointments): string
    {
        $timezone = $barbershop->timezone ?: 'Atlantic/Azores';
        $rows = [
            ['Cliente', 'Data', 'Hora', 'Serviço', 'Barbeiro', 'Contacto', 'Estado da marcação'],
        ];

        foreach ($appointments as $appointment) {
            $startsAt = $appointment->starts_at?->copy()->timezone($timezone);

            $rows[] = [
                $appointment->client_name,
                $startsAt instanceof CarbonInterface ? $startsAt->format('d/m/Y') : '',
                $startsAt instanceof CarbonInterface ? $startsAt->format('H:i') : '',
                $appointment->service?->name ?? '',
                $appointment->barber?->name ?? '',
                $appointment->client_phone,
                $appointment->status instanceof \BackedEnum ? $appointment->status->value : (string) $appointment->status,
            ];
        }

        $xmlRows = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            $cells = [];

            foreach ($row as $columnIndex => $value) {
                $cellReference = $this->columnName($columnIndex + 1).$rowNumber;
                $style = $rowNumber === 1 ? ' s="1"' : '';
                $cells[] = sprintf(
                    '<c r="%s" t="inlineStr"%s><is><t>%s</t></is></c>',
                    $cellReference,
                    $style,
                    $this->xml((string) $value)
                );
            }

            $xmlRows[] = sprintf('<row r="%d">%s</row>', $rowNumber, implode('', $cells));
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<cols>'
            .'<col min="1" max="1" width="24" customWidth="1"/>'
            .'<col min="2" max="2" width="14" customWidth="1"/>'
            .'<col min="3" max="3" width="10" customWidth="1"/>'
            .'<col min="4" max="4" width="24" customWidth="1"/>'
            .'<col min="5" max="5" width="22" customWidth="1"/>'
            .'<col min="6" max="6" width="18" customWidth="1"/>'
            .'<col min="7" max="7" width="20" customWidth="1"/>'
            .'</cols>'
            .'<sheetData>'.implode('', $xmlRows).'</sheetData>'
            .'</worksheet>';
    }

    private function columnName(int $index): string
    {
        $name = '';

        while ($index > 0) {
            $index--;
            $name = chr(65 + ($index % 26)).$name;
            $index = intdiv($index, 26);
        }

        return $name;
    }

    private function xml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    private function contentTypesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private function relsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private function workbookXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Agenda" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private function workbookRelsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private function stylesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            .'<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/></cellXfs>'
            .'</styleSheet>';
    }
}
