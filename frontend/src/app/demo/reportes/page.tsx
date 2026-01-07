'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Demo data for reports - all categories
const allDemoTicketsByCategory = [
  { categoria: 'Sistema de Ventas', total: 45, porcentaje: 28.8 },
  { categoria: 'Portal Web', total: 32, porcentaje: 20.5 },
  { categoria: 'Aplicacion Movil', total: 28, porcentaje: 17.9 },
  { categoria: 'Sistema de Inventario', total: 24, porcentaje: 15.4 },
  { categoria: 'Facturacion', total: 15, porcentaje: 9.6 },
  { categoria: 'Otros', total: 12, porcentaje: 7.7 },
];

const allDemoTicketsByPriority = [
  { prioridad: 'Alta', total: 38, porcentaje: 24.4 },
  { prioridad: 'Media', total: 78, porcentaje: 50.0 },
  { prioridad: 'Baja', total: 40, porcentaje: 25.6 },
];

const allDemoEmployeePerformance = [
  { nombre: 'Maria Garcia', ticketsResueltos: 45, tiempoPromedio: '4.2 horas', satisfaccion: '95%', categoria: 'Sistema de Ventas' },
  { nombre: 'Carlos Rodriguez', ticketsResueltos: 38, tiempoPromedio: '5.1 horas', satisfaccion: '92%', categoria: 'Portal Web' },
  { nombre: 'Ana Martinez', ticketsResueltos: 32, tiempoPromedio: '3.8 horas', satisfaccion: '98%', categoria: 'Aplicacion Movil' },
  { nombre: 'Luis Fernandez', ticketsResueltos: 28, tiempoPromedio: '6.2 horas', satisfaccion: '88%', categoria: 'Sistema de Inventario' },
  { nombre: 'Sofia Torres', ticketsResueltos: 25, tiempoPromedio: '4.5 horas', satisfaccion: '91%', categoria: 'Facturacion' },
];

const allDemoSLACompliance = {
  cumplido: 142,
  incumplido: 14,
  porcentajeCumplimiento: 91.0,
};

// Category options for filter
const categorias = ['Sistema de Ventas', 'Portal Web', 'Aplicacion Movil', 'Sistema de Inventario', 'Facturacion', 'Otros'];

export default function DemoReportesPage() {
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportSuccessExcel, setExportSuccessExcel] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  // Filtered data based on category selection
  const filteredData = useMemo(() => {
    if (!filtroCategoria) {
      // No filter - return all data
      return {
        ticketsByCategory: allDemoTicketsByCategory,
        ticketsByPriority: allDemoTicketsByPriority,
        employeePerformance: allDemoEmployeePerformance.map(({ categoria, ...rest }) => rest),
        ticketStats: {
          total: 156,
          abiertos: 42,
          enProceso: 35,
          enEspera: 18,
          resueltos: 48,
          cerrados: 13,
        },
        slaCompliance: allDemoSLACompliance,
      };
    }

    // Filter by category
    const filteredCategories = allDemoTicketsByCategory.filter(c => c.categoria === filtroCategoria);
    const filteredEmployees = allDemoEmployeePerformance
      .filter(e => e.categoria === filtroCategoria)
      .map(({ categoria, ...rest }) => rest);

    // Calculate filtered totals
    const filteredTotal = filteredCategories.reduce((sum, c) => sum + c.total, 0);

    // Recalculate percentages for filtered priority data
    const priorityRatio = filteredTotal / 156; // Ratio based on total
    const filteredPriority = allDemoTicketsByPriority.map(p => ({
      prioridad: p.prioridad,
      total: Math.round(p.total * priorityRatio),
      porcentaje: p.porcentaje,
    }));

    // Recalculate stats for filtered data
    const statsRatio = filteredTotal / 156;
    const filteredStats = {
      total: filteredTotal,
      abiertos: Math.round(42 * statsRatio),
      enProceso: Math.round(35 * statsRatio),
      enEspera: Math.round(18 * statsRatio),
      resueltos: Math.round(48 * statsRatio),
      cerrados: Math.round(13 * statsRatio),
    };

    // Recalculate SLA for filtered data
    const filteredSLA = {
      cumplido: Math.round(142 * statsRatio),
      incumplido: Math.round(14 * statsRatio),
      porcentajeCumplimiento: allDemoSLACompliance.porcentajeCumplimiento,
    };

    return {
      ticketsByCategory: filteredCategories,
      ticketsByPriority: filteredPriority,
      employeePerformance: filteredEmployees,
      ticketStats: filteredStats,
      slaCompliance: filteredSLA,
    };
  }, [filtroCategoria]);

  // Shorthand access to filtered data
  const demoTicketStats = filteredData.ticketStats;
  const demoTicketsByCategory = filteredData.ticketsByCategory;
  const demoTicketsByPriority = filteredData.ticketsByPriority;
  const demoEmployeePerformance = filteredData.employeePerformance;
  const demoSLACompliance = filteredData.slaCompliance;

  const formatDate = () => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date());
  };

  const exportToPDF = async () => {
    setExporting(true);
    setExportSuccess(false);

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Primary blue
      doc.text('MDAyuda - Reporte de Estadisticas', pageWidth / 2, 20, { align: 'center' });

      // Date and filter info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado: ${formatDate()}`, pageWidth / 2, 28, { align: 'center' });
      if (filtroCategoria) {
        doc.setTextColor(37, 99, 235);
        doc.text(`Filtro aplicado: ${filtroCategoria}`, pageWidth / 2, 34, { align: 'center' });
      }

      // Section 1: General Statistics
      const startY = filtroCategoria ? 45 : 40;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('1. Resumen General de Tickets', 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Estado', 'Cantidad']],
        body: [
          ['Total de Tickets', demoTicketStats.total.toString()],
          ['Abiertos', demoTicketStats.abiertos.toString()],
          ['En Proceso', demoTicketStats.enProceso.toString()],
          ['En Espera', demoTicketStats.enEspera.toString()],
          ['Resueltos', demoTicketStats.resueltos.toString()],
          ['Cerrados', demoTicketStats.cerrados.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // Section 2: Tickets by Category
      const finalY1 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 90;
      doc.setFontSize(14);
      doc.text('2. Tickets por Categoria', 14, finalY1 + 15);

      autoTable(doc, {
        startY: finalY1 + 20,
        head: [['Categoria', 'Total', 'Porcentaje']],
        body: demoTicketsByCategory.map(item => [
          item.categoria,
          item.total.toString(),
          `${item.porcentaje}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // Section 3: Tickets by Priority
      const finalY2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.text('3. Tickets por Prioridad', 14, finalY2 + 15);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Prioridad', 'Total', 'Porcentaje']],
        body: demoTicketsByPriority.map(item => [
          item.prioridad,
          item.total.toString(),
          `${item.porcentaje}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // Add new page for employee performance
      doc.addPage();

      // Section 4: Employee Performance
      doc.setFontSize(14);
      doc.text('4. Rendimiento de Empleados', 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [['Empleado', 'Tickets Resueltos', 'Tiempo Promedio', 'Satisfaccion']],
        body: demoEmployeePerformance.map(item => [
          item.nombre,
          item.ticketsResueltos.toString(),
          item.tiempoPromedio,
          item.satisfaccion,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // Section 5: SLA Compliance
      const finalY4 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
      doc.setFontSize(14);
      doc.text('5. Cumplimiento de SLA', 14, finalY4 + 15);

      autoTable(doc, {
        startY: finalY4 + 20,
        head: [['Metrica', 'Valor']],
        body: [
          ['Tickets con SLA Cumplido', demoSLACompliance.cumplido.toString()],
          ['Tickets con SLA Incumplido', demoSLACompliance.incumplido.toString()],
          ['Porcentaje de Cumplimiento', `${demoSLACompliance.porcentajeCumplimiento}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      // Footer
      const finalY5 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 130;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Este reporte fue generado automaticamente por MDAyuda', pageWidth / 2, finalY5 + 20, { align: 'center' });

      // Save the PDF
      doc.save(`reporte-mdayuda-${new Date().toISOString().split('T')[0]}.pdf`);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar el PDF. Intente nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExportingExcel(true);
    setExportSuccessExcel(false);

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Resumen General
      const filterInfo = filtroCategoria ? [`Filtro aplicado: ${filtroCategoria}`] : [];
      const resumenData = [
        ['MDAyuda - Reporte de Estadisticas'],
        [`Generado: ${formatDate()}`],
        ...filterInfo.map(f => [f]),
        [],
        ['Resumen General de Tickets'],
        ['Estado', 'Cantidad'],
        ['Total de Tickets', demoTicketStats.total],
        ['Abiertos', demoTicketStats.abiertos],
        ['En Proceso', demoTicketStats.enProceso],
        ['En Espera', demoTicketStats.enEspera],
        ['Resueltos', demoTicketStats.resueltos],
        ['Cerrados', demoTicketStats.cerrados],
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      // Set column widths
      wsResumen['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');

      // Sheet 2: Tickets por Categoria
      const categoriaData = [
        ['Tickets por Categoria'],
        ['Categoria', 'Total', 'Porcentaje'],
        ...demoTicketsByCategory.map(item => [item.categoria, item.total, `${item.porcentaje}%`]),
      ];
      const wsCategoria = XLSX.utils.aoa_to_sheet(categoriaData);
      wsCategoria['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsCategoria, 'Por Categoria');

      // Sheet 3: Tickets por Prioridad
      const prioridadData = [
        ['Tickets por Prioridad'],
        ['Prioridad', 'Total', 'Porcentaje'],
        ...demoTicketsByPriority.map(item => [item.prioridad, item.total, `${item.porcentaje}%`]),
      ];
      const wsPrioridad = XLSX.utils.aoa_to_sheet(prioridadData);
      wsPrioridad['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsPrioridad, 'Por Prioridad');

      // Sheet 4: Rendimiento de Empleados
      const empleadosData = [
        ['Rendimiento de Empleados'],
        ['Empleado', 'Tickets Resueltos', 'Tiempo Promedio', 'Satisfaccion'],
        ...demoEmployeePerformance.map(item => [
          item.nombre,
          item.ticketsResueltos,
          item.tiempoPromedio,
          item.satisfaccion,
        ]),
      ];
      const wsEmpleados = XLSX.utils.aoa_to_sheet(empleadosData);
      wsEmpleados['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsEmpleados, 'Rendimiento Empleados');

      // Sheet 5: Cumplimiento SLA
      const slaData = [
        ['Cumplimiento de SLA'],
        ['Metrica', 'Valor'],
        ['Tickets con SLA Cumplido', demoSLACompliance.cumplido],
        ['Tickets con SLA Incumplido', demoSLACompliance.incumplido],
        ['Porcentaje de Cumplimiento', `${demoSLACompliance.porcentajeCumplimiento}%`],
      ];
      const wsSLA = XLSX.utils.aoa_to_sheet(slaData);
      wsSLA['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSLA, 'Cumplimiento SLA');

      // Generate the file and trigger download
      XLSX.writeFile(wb, `reporte-mdayuda-${new Date().toISOString().split('T')[0]}.xlsx`);

      setExportSuccessExcel(true);
      setTimeout(() => setExportSuccessExcel(false), 3000);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error al exportar el Excel. Intente nuevamente.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6" ref={reportRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Demo - Reportes y Estadisticas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Esta pagina demuestra la funcionalidad de exportacion con filtros
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="filtroCategoria" className="text-sm text-gray-600 dark:text-gray-400">
                Filtrar por:
              </label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar a PDF
                </>
              )}
            </button>
            <button
              onClick={exportToExcel}
              disabled={exportingExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exportingExcel ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar a Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success message for PDF */}
        {exportSuccess && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3" role="alert">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-300">
              ¡PDF exportado exitosamente! Revisa tu carpeta de descargas.
            </span>
          </div>
        )}

        {/* Success message for Excel */}
        {exportSuccessExcel && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3" role="alert">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-300">
              ¡Excel exportado exitosamente! Revisa tu carpeta de descargas.
            </span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{demoTicketStats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Abiertos</p>
            <p className="text-2xl font-bold text-blue-600">{demoTicketStats.abiertos}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">En Proceso</p>
            <p className="text-2xl font-bold text-yellow-600">{demoTicketStats.enProceso}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">En Espera</p>
            <p className="text-2xl font-bold text-orange-600">{demoTicketStats.enEspera}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Resueltos</p>
            <p className="text-2xl font-bold text-green-600">{demoTicketStats.resueltos}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Cerrados</p>
            <p className="text-2xl font-bold text-gray-600">{demoTicketStats.cerrados}</p>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Tickets por Categoria
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {demoTicketsByCategory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tickets by Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Tickets por Prioridad
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {demoTicketsByPriority.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.prioridad === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          item.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                          {item.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Employee Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Rendimiento de Empleados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tickets Resueltos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tiempo Promedio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Satisfaccion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {demoEmployeePerformance.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ticketsResueltos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.tiempoPromedio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{item.satisfaccion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cumplimiento de SLA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{demoSLACompliance.cumplido}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tickets con SLA Cumplido</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{demoSLACompliance.incumplido}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tickets con SLA Incumplido</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{demoSLACompliance.porcentajeCumplimiento}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Porcentaje de Cumplimiento</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${demoSLACompliance.porcentajeCumplimiento}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {filtroCategoria && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-yellow-700 dark:text-yellow-300">
                Filtro activo: <strong>{filtroCategoria}</strong> - Los datos y exportaciones solo muestran esta categoria
              </span>
            </div>
            <button
              onClick={() => setFiltroCategoria('')}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Feature info */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Informacion de Demo - Features #148, #149 y #150
          </h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Esta pagina demuestra la funcionalidad de <strong>exportacion a PDF, Excel con filtros</strong>.
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li>Haz clic en &quot;Exportar a PDF&quot; para descargar el reporte en formato PDF</li>
            <li>Haz clic en &quot;Exportar a Excel&quot; para descargar el reporte en formato Excel</li>
            <li>Usa el filtro de categoria para ver solo datos de una categoria especifica</li>
            <li><strong>Las exportaciones respetan el filtro activo</strong> - solo se exportan los datos filtrados</li>
            <li>El Excel contiene multiples hojas con cada seccion del reporte</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            href="/demo"
            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          >
            ← Volver a la demo principal
          </Link>
        </div>
      </div>
    </div>
  );
}
