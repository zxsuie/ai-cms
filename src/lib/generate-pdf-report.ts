
'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import { format, parseISO } from 'date-fns';
import type { GenerateAiReportOutput } from '@/ai/flows/ai-report-generator';
import type { ActivityLog, StudentVisit, Appointment } from './types';

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

interface PdfReportData {
    aiReport: GenerateAiReportOutput;
    reportType: 'weekly' | 'monthly';
    visits: StudentVisit[];
    appointments: Appointment[];
    logs: ActivityLog[];
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

export async function generatePdfReport(data: PdfReportData) {
    const { aiReport, reportType, visits, appointments, logs } = data;
    const doc = new jsPDF() as jsPDFWithAutoTable;

    const today = new Date();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 40;

    // Cover Page
    addHeader(doc, `AI-Generated ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Clinic Report`);
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
    const summaryLines = doc.splitTextToSize(aiReport.summaryText.replace(/\*\*/g, ''), pageWidth - margin * 2);
    doc.text(summaryLines, margin, currentY);
    let lastY = currentY + summaryLines.length * 5 + 10;


    // Detailed Analysis
    doc.addPage();
    currentY = 30;
    addHeader(doc, `Detailed Analysis`);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Detailed Analysis', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Student Visits:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(aiReport.totalVisits.toString(), margin + 55, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Appointments:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(aiReport.totalAppointments.toString(), margin + 55, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Most Common Symptoms:', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    aiReport.mostCommonSymptoms.forEach(symptom => {
        doc.text(`• ${symptom}`, margin + 5, currentY);
        currentY += 6;
    });
    currentY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines Dispensed Summary:', margin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    const medicineLines = doc.splitTextToSize(aiReport.medicinesDispensed.replace(/\*\*/g, ''), pageWidth - margin * 2);
    doc.text(medicineLines, margin, currentY);
    lastY = currentY + medicineLines.length * 5 + 10;

    // Student Visits Table
    doc.addPage();
    currentY = 30;
    addHeader(doc, `Student Data`);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Student Visits Log', margin, currentY);

    const visitTableData = visits.map(v => [
        format(parseISO(v.timestamp), 'PP'),
        v.studentName,
        `${v.studentYear} - ${v.studentSection}`,
        v.reason,
        v.symptoms,
    ]);

    doc.autoTable({
        head: [['Date', 'Student Name', 'Year & Section', 'Reason', 'Symptoms']],
        body: visitTableData,
        startY: currentY + 10,
        headStyles: { fillColor: [63, 81, 181] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: 40 }, 4: { cellWidth: 40 } },
    });
    lastY = doc.autoTable.previous.finalY + 15;


    // Appointments Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Scheduled Appointments', margin, lastY);
    
    const appointmentTableData = appointments.map(a => [
        format(parseISO(a.appointmentDate), 'PP'),
        format(new Date(`1970-01-01T${a.appointmentTime}`), 'p'),
        a.studentName,
        `${a.studentYear} - ${a.studentSection}`,
        a.reason,
    ]);

     doc.autoTable({
        head: [['Date', 'Time', 'Student Name', 'Year & Section', 'Reason']],
        body: appointmentTableData,
        startY: lastY + 10,
        headStyles: { fillColor: [63, 81, 181] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 4: { cellWidth: 50 } },
    });
    lastY = doc.autoTable.previous.finalY + 15;


    // Activity Log Data
    doc.addPage();
    currentY = 30;
    addHeader(doc, 'System Activity Log');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. System Activity Log', margin, currentY);
    
    const logTableData = logs.map(log => [
        format(parseISO(log.timestamp), 'PP p'),
        log.userName,
        formatActionType(log.actionType),
        Object.entries(log.details).map(([key, value]) => `${key}: ${value}`).join('\n')
    ]);

    doc.autoTable({
        head: [['Timestamp', 'User', 'Action', 'Details']],
        body: logTableData,
        startY: currentY + 10,
        headStyles: { fillColor: [63, 81, 181] }, 
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 3: { cellWidth: 70 } },
    });

    addFooter(doc);
    
    const fileName = `Detailed_Report_Nurse-Manuel_${format(today, 'yyyy-MM-dd_HHmm')}.pdf`;
    
    doc.save(fileName);
}
