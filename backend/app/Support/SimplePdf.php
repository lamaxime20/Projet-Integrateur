<?php

namespace App\Support;

class SimplePdf
{
    private array $commands = [];

    public function __construct(
        private string $title,
        private string $subtitle = '',
    ) {}

    public function text(float $x, float $y, string $text, int $size = 10): void
    {
        $this->commands[] = sprintf(
            'BT /F1 %d Tf %.2F %.2F Td (%s) Tj ET',
            $size,
            $x,
            $y,
            $this->escape($text)
        );
    }

    public function line(float $x1, float $y1, float $x2, float $y2): void
    {
        $this->commands[] = sprintf('%.2F %.2F m %.2F %.2F l S', $x1, $y1, $x2, $y2);
    }

    public function rect(float $x, float $y, float $width, float $height): void
    {
        $this->commands[] = sprintf('%.2F %.2F %.2F %.2F re S', $x, $y, $width, $height);
    }

    public function drawLineChart(array $points, string $label, string $unit, float $x = 54, float $y = 450, float $width = 500, float $height = 220): void
    {
        $this->text($x, $y + $height + 20, $label, 12);
        $this->rect($x, $y, $width, $height);

        if (count($points) < 2) {
            $this->text($x + 16, $y + ($height / 2), 'Pas assez de mesures pour tracer la courbe.', 10);
            return;
        }

        $values = array_map(fn ($point) => (float) $point['valeur'], $points);
        $min = min($values);
        $max = max($values);
        if ($min === $max) {
            $min -= 1;
            $max += 1;
        }

        $this->text($x, $y + $height + 4, round($max, 2) . $unit, 8);
        $this->text($x, $y - 14, round($min, 2) . $unit, 8);

        $lastX = null;
        $lastY = null;
        $count = count($points);

        foreach ($points as $index => $point) {
            $pointX = $x + ($count === 1 ? 0 : ($index / ($count - 1)) * $width);
            $pointY = $y + (((float) $point['valeur'] - $min) / ($max - $min)) * $height;

            if ($lastX !== null && $lastY !== null) {
                $this->line($lastX, $lastY, $pointX, $pointY);
            }

            $lastX = $pointX;
            $lastY = $pointY;
        }
    }

    public function drawTimeline(array $periods, string $label, float $x = 54, float $y = 500, float $width = 500, float $height = 36): void
    {
        $this->text($x, $y + 56, $label, 12);
        $this->rect($x, $y, $width, $height);

        if (!$periods) {
            $this->text($x + 16, $y + 12, 'Aucune période disponible.', 10);
            return;
        }

        $first = strtotime($periods[0]['debut']);
        $last = strtotime($periods[array_key_last($periods)]['fin']);
        $span = max(1, $last - $first);

        foreach ($periods as $period) {
            $start = strtotime($period['debut']);
            $end = strtotime($period['fin']);
            $segmentX = $x + (($start - $first) / $span) * $width;
            $segmentWidth = max(2, (($end - $start) / $span) * $width);
            $this->rect($segmentX, $y, $segmentWidth, $height);
            $this->text($segmentX + 2, $y + 12, $period['etat'], 7);
        }
    }

    public function table(array $headers, array $rows, float $x = 54, float $y = 390, int $maxRows = 18): void
    {
        $this->text($x, $y + 24, 'Tableau des données', 12);
        $this->text($x, $y, implode(' | ', $headers), 8);

        $cursor = $y - 16;
        foreach (array_slice($rows, 0, $maxRows) as $row) {
            $this->text($x, $cursor, implode(' | ', array_map(fn ($cell) => (string) $cell, $row)), 8);
            $cursor -= 14;
        }

        if (count($rows) > $maxRows) {
            $this->text($x, $cursor, '... ' . (count($rows) - $maxRows) . ' lignes supplémentaires dans le CSV.', 8);
        }
    }

    public function output(): string
    {
        array_unshift($this->commands, '0.2 w');
        array_unshift($this->commands, sprintf('BT /F1 10 Tf 54 742 Td (%s) Tj ET', $this->escape($this->subtitle)));
        array_unshift($this->commands, sprintf('BT /F1 18 Tf 54 766 Td (%s) Tj ET', $this->escape($this->title)));

        $stream = implode("\n", $this->commands);
        $objects = [
            '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
            '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
            "5 0 obj << /Length " . strlen($stream) . " >> stream\n{$stream}\nendstream endobj",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object . "\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xref}\n%%EOF";

        return $pdf;
    }

    private function escape(string $text): string
    {
        $encoded = iconv('UTF-8', 'Windows-1252//TRANSLIT', $text) ?: $text;

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $encoded);
    }
}
