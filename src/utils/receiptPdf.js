import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

/**
 * Generate and download an official digital rent receipt PDF
 */
export function generateRentReceiptPDF(payment, houseSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const houseName = houseSettings?.houseName || 'Student House Rental Service';
  const contactPhone = houseSettings?.contactPhone || 'N/A';
  const currency = houseSettings?.currency || '₹';

  // --- Header Background Banner ---
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 40, 'F');

  // Title & House Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(houseName.toUpperCase(), 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL MONTHLY RENT & UTILITY RECEIPT', 15, 26);
  doc.text(`Contact: ${contactPhone}`, 15, 33);

  // Receipt Number & Date (Right aligned in banner)
  const receiptNo = `REC-${payment.id ? payment.id.slice(-6).toUpperCase() : 'PENDING'}`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECEIPT: ${receiptNo}`, 195, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const paymentDate = payment.createdAt ? formatDate(payment.createdAt) : formatDate(new Date());
  doc.text(`Issued Date: ${paymentDate}`, 195, 26, { align: 'right' });

  // --- Student Information Section ---
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TENANT DETAILS', 15, 52);

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(15, 54, 195, 54);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.studentName || 'Student', 48, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Room Number:', 15, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Room #${payment.roomNumber || 'N/A'}`, 48, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Billing Month:', 120, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`${payment.month} ${payment.year}`, 155, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', 120, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('VERIFIED & APPROVED', 155, 70);

  // --- Breakdown Table ---
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT BREAKDOWN', 15, 86);

  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(15, 90, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION / ITEM', 20, 95.5);
  doc.text('DETAILS / READING', 105, 95.5);
  doc.text('AMOUNT', 190, 95.5, { align: 'right' });

  let y = 104;

  // Item 1: Base Rent
  doc.setFont('helvetica', 'normal');
  doc.text('Room Base Rent', 20, y);
  doc.text(`Monthly fixed rent`, 105, y);
  doc.text(formatCurrency(payment.rentAmount || 0, currency), 190, y, { align: 'right' });
  doc.line(15, y + 3, 195, y + 3);

  // Item 2: Electricity
  y += 10;
  const units = payment.electricityUnits || 0;
  const rate = payment.unitRate || houseSettings?.electricityRate || 0;
  const elecAmount = payment.electricityAmount || (units * rate);
  doc.text('Electricity Utility Charge', 20, y);
  doc.text(`${units} Units @ ${currency}${rate}/unit`, 105, y);
  doc.text(formatCurrency(elecAmount, currency), 190, y, { align: 'right' });
  doc.line(15, y + 3, 195, y + 3);

  // Item 3: Other Charges (Water/Maintenance)
  if (payment.otherAmount && Number(payment.otherAmount) > 0) {
    y += 10;
    doc.text('Maintenance / Water / Misc.', 20, y);
    doc.text('House services fee', 105, y);
    doc.text(formatCurrency(payment.otherAmount, currency), 190, y, { align: 'right' });
    doc.line(15, y + 3, 195, y + 3);
  }

  // Total Amount Row
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y - 6, 180, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL PAID:', 105, y + 2);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(payment.totalAmount || 0, currency), 190, y + 2, { align: 'right' });

  // --- Transaction Information ---
  y += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION DETAILS', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.paymentMode ? payment.paymentMode.toUpperCase() : 'UPI / ONLINE', 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Transaction / UTR ID:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.transactionId || 'Verified By Landlord', 155, y);

  // Verification & Signature Box
  y += 28;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(52, 211, 153); // emerald-400
  doc.roundedRect(15, y, 90, 32, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70); // emerald-800
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: VERIFIED & CONFIRMED', 20, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Payment received in full and verified against', 20, y + 16);
  doc.text('landlord account / bank statement.', 20, y + 21);
  doc.text(`Approved on: ${paymentDate}`, 20, y + 27);

  // Landlord Signature Stamp
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(120, y, 75, 32, 2, 2);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Authorized Landlord / Warden Signoff', 125, y + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(houseName, 125, y + 22);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('(System generated digital seal)', 125, y + 27);

  // Footer Note
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt for student house accommodation records.', 105, 285, { align: 'center' });

  // Save the PDF
  const filename = `Rent_Receipt_${payment.month}_${payment.year}_Room${payment.roomNumber || 'Unknown'}.pdf`;
  doc.save(filename);
}

