import api from './api';
import type { ComparisonRequest, ComparisonResult } from '../types/comparison';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const comparisonService = {
  compareApplications: async (
    request: ComparisonRequest
  ): Promise<ComparisonResult> => {
    const response = await api.post('/compare/', request);
    return response.data;
  },

  getComparisonHistory: async (): Promise<ComparisonResult[]> => {
    const response = await api.get('/compare/history');
    return response.data;
  },

  exportComparison: async (
    comparisonResult: ComparisonResult,
    format: 'pdf' | 'csv' | 'json'
  ): Promise<Blob> => {
    if (format === 'json') {
      const blob = new Blob(
        [JSON.stringify(comparisonResult, null, 2)],
        { type: 'application/json' }
      );
      return blob;
    } else if (format === 'csv') {
      return comparisonService.exportToCSV(comparisonResult);
    } else if (format === 'pdf') {
      return comparisonService.exportToPDF(comparisonResult);
    } else {
      throw new Error('Unsupported export format');
    }
  },

  exportToCSV: (comparisonResult: ComparisonResult): Blob => {
    const headers = [
      'Component Name',
      'App1 Version',
      'App2 Version',
      'Difference Type',
      'App1 License',
      'App2 License'
    ];
    
    const rows = comparisonResult.differences.map(diff => [
      diff.component_name,
      diff.app1_version || 'N/A',
      diff.app2_version || 'N/A',
      diff.difference_type,
      diff.app1_license || 'N/A',
      diff.app2_license || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  },

  exportToPDF: (comparisonResult: ComparisonResult): Blob => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(91, 111, 181);
    doc.text('SBOM Comparison Report', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    // Add comparison summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Comparison Summary', 14, 38);
    
    doc.setFontSize(10);
    doc.text(`Application 1: ${comparisonResult.app1_name} (${comparisonResult.app1_platform})`, 14, 46);
    doc.text(`Application 2: ${comparisonResult.app2_name} (${comparisonResult.app2_platform})`, 14, 52);
    doc.text(`Similarity: ${comparisonResult.summary.similarity_percentage}%`, 14, 58);
    doc.text(`Common Components: ${comparisonResult.summary.total_common}`, 14, 64);
    doc.text(`Unique to App 1: ${comparisonResult.summary.total_unique_app1}`, 14, 70);
    doc.text(`Unique to App 2: ${comparisonResult.summary.total_unique_app2}`, 14, 76);
    doc.text(`Version Differences: ${comparisonResult.summary.total_version_differences}`, 14, 82);
    doc.text(`License Differences: ${comparisonResult.summary.license_differences}`, 14, 88);
    
    // Add differences table
    const tableData = comparisonResult.differences.map(diff => [
      diff.component_name,
      diff.app1_version || 'N/A',
      diff.app2_version || 'N/A',
      diff.difference_type,
      diff.app1_license || 'N/A',
      diff.app2_license || 'N/A'
    ]);
    
    autoTable(doc, {
      head: [['Component', 'App 1 Version', 'App 2 Version', 'Type', 'App 1 License', 'App 2 License']],
      body: tableData,
      startY: 95,
      theme: 'grid',
      headStyles: {
        fillColor: [91, 111, 181],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });
    
    return doc.output('blob');
  }
};