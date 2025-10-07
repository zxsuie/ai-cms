
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Ensure you have this import for autoTable
import { format } from 'date-fns';
import type { GenerateAiReportOutput } from '@/ai/flows/ai-report-generator';
import type { ActivityLog } from './types';

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(63, 81, 181); // #3F51B5
  doc.text('iClinicMate', 20, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 20, 28);
}

function addFooter(doc: jsPDFWithAutoTable) {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
        doc.text(`Report Generated: ${format(new Date(), 'PPpp')}`, 20, doc.internal.pageSize.height - 10);
    }
}

function formatActionType(type: string) {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generatePdfReport(report: GenerateAiReportOutput, type: 'weekly' | 'monthly', logs: ActivityLog[]) {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const today = new Date();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 40;

    // Cover Page
    addHeader(doc, `AI-Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Clinic Report`);
    doc.setFontSize(12);
    doc.text(`Generated for: Nurse Manuel`, margin, currentY);
    currentY += 7;
    doc.text(`Date: ${format(today, 'MMMM do, yyyy')}`, margin, currentY);
    
    currentY += 15;

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Summary', margin, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(report.summaryText.replace(/\*\*/g, ''), pageWidth - margin * 2);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * 5 + 10;


    // Detailed Analysis
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Detailed Analysis', margin, currentY);
    currentY += 10;
    
    // Total Visits
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Student Visits:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(report.totalVisits.toString(), margin + 50, currentY);
    currentY += 10;
    
    // Most Common Symptoms
    doc.setFont('helvetica', 'bold');
    doc.text('Most Common Symptoms:', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    report.mostCommonSymptoms.forEach(symptom => {
        doc.text(`• ${symptom}`, margin + 5, currentY);
        currentY += 6;
    });
    currentY += 4;
    
    // Medicines Dispensed
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines Dispensed Summary:', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    const medicineLines = doc.splitTextToSize(report.medicinesDispensed.replace(/\*\*/g, ''), pageWidth - margin * 2);
    doc.text(medicineLines, margin, currentY);
    currentY += medicineLines.length * 5 + 10;
    

    // Activity Log Data
    doc.addPage();
    currentY = 30;
    addHeader(doc, 'Detailed Activity Log');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Activity & Log Data', margin, currentY);
    currentY += 10;

    const tableData = logs.map(log => [
        format(new Date(log.timestamp), 'PP p'),
        log.userName,
        formatActionType(log.actionType),
        Object.entries(log.details).map(([key, value]) => `${key}: ${value}`).join('\n')
    ]);

    doc.autoTable({
        head: [['Timestamp', 'User', 'Action', 'Details']],
        body: tableData,
        startY: currentY,
        headStyles: { fillColor: [63, 81, 181] }, // #3F51B5
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: 70 } },
    });

    addFooter(doc);
    
    const fileName = `Detailed_Report_Nurse-Manuel_${format(today, 'yyyy-MM-dd_HHmm')}.pdf`;
    doc.save(fileName);
}
