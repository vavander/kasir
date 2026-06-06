<?php

declare(strict_types=1);

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ReportFilterRequest;
use App\Models\Setting;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function index(ReportFilterRequest $request): InertiaResponse
    {
        $filters = $request->filters();
        $range = $this->reportService->resolveRange($filters);
        $report = $this->reportService->generate($range['start'], $range['end']);

        return Inertia::render('Owner/Report/Index', [
            'report' => $report,
            'filters' => $filters,
            'range' => [
                'mode' => $range['mode'],
                'label' => $range['label'],
                'start' => $range['start']->toDateString(),
                'end' => $range['end']->toDateString(),
            ],
        ]);
    }

    public function exportPdf(ReportFilterRequest $request): Response
    {
        $range = $this->reportService->resolveRange($request->filters());
        $report = $this->reportService->generate($range['start'], $range['end']);

        $pdf = Pdf::loadView('reports.pdf', [
            'report' => $report,
            'range' => $range,
            'setting' => Setting::current(),
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        // Stream inline so the browser previews it (opens in a new tab) instead of downloading.
        return $pdf->stream('laporan-'.$range['start']->toDateString().'-'.$range['end']->toDateString().'.pdf');
    }

    public function exportExcel(ReportFilterRequest $request): StreamedResponse
    {
        $range = $this->reportService->resolveRange($request->filters());
        $report = $this->reportService->generate($range['start'], $range['end']);

        $filename = 'laporan-'.$range['start']->toDateString().'-'.$range['end']->toDateString().'.csv';

        return response()->streamDownload(function () use ($report, $range) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM so Excel renders accents/rupiah correctly.
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, ['Laporan Periode', $range['label']]);
            fputcsv($out, []);

            fputcsv($out, ['Ringkasan']);
            fputcsv($out, ['Omzet', $report['summary']['omzet']]);
            fputcsv($out, ['HPP', $report['summary']['hpp']]);
            fputcsv($out, ['Laba Kotor', $report['summary']['laba_kotor']]);
            fputcsv($out, ['Pengeluaran', $report['summary']['pengeluaran']]);
            fputcsv($out, ['Laba Bersih', $report['summary']['laba_bersih']]);
            fputcsv($out, []);

            fputcsv($out, ['Rincian Harian']);
            fputcsv($out, ['Tanggal', 'Omzet', 'HPP', 'Pengeluaran', 'Laba Bersih']);
            foreach ($report['daily'] as $row) {
                fputcsv($out, [
                    $row['label'],
                    $row['omzet'],
                    $row['hpp'],
                    $row['pengeluaran'],
                    $row['laba_bersih'],
                ]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Pengeluaran per Kategori']);
            fputcsv($out, ['Kategori', 'Total']);
            foreach ($report['expense_by_category'] as $row) {
                fputcsv($out, [$row['category'], $row['total']]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Menu Terlaris']);
            fputcsv($out, ['Menu', 'Qty Terjual', 'Pendapatan']);
            foreach ($report['top_menus'] as $row) {
                fputcsv($out, [$row['menu_name'], $row['total_qty'], $row['total_revenue']]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
