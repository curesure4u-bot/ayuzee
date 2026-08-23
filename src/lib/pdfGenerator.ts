import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Flag 37: PDF Generation for Bills and Prescriptions
 *
 * Usage:
 *   generateBillPdf({ billNumber: "INV-2608-0001", patientName: "Ramesh", items: [...] });
 *   generatePrescriptionPdf({ doctorName: "Dr. Saleem", medicines: [...] });
 */

// ─── Hospital Header (reusable) ──────────────────────────────────────────────

function addHospitalHeader(doc: jsPDF) {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AYUZEE HEALTHCARE", 105, 15, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("AYUSH Super Specialty · Ayurveda · Siddha · Yoga · Naturopathy · Acupuncture", 105, 21, { align: "center" });
  doc.text("#11, Main Road, Kadayanallur, TN · Ph: +91 99999 99999 · www.ayuzee.com", 105, 26, { align: "center" });
  doc.setDrawColor(249, 115, 22); // orange
  doc.setLineWidth(0.5);
  doc.line(15, 29, 195, 29);
}

// ─── Bill PDF ─────────────────────────────────────────────────────────────────

export interface BillPdfData {
  billNumber: string;
  billDate: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  doctorName?: string;
  department?: string;
  items: { name: string; qty: number; rate: number; amount: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMode: string;
  receiptNumber?: string;
}

export function generateBillPdf(data: BillPdfData): void {
  const doc = new jsPDF();
  addHospitalHeader(doc);

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 36, { align: "center" });

  // Bill info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Bill No: ${data.billNumber}`, 15, 44);
  doc.text(`Date: ${data.billDate}`, 150, 44);
  doc.text(`Patient: ${data.patientName} (${data.patientId})`, 15, 50);
  doc.text(`Phone: ${data.patientPhone || "—"}`, 150, 50);
  if (data.doctorName) doc.text(`Doctor: ${data.doctorName}`, 15, 56);
  if (data.department) doc.text(`Dept: ${data.department}`, 150, 56);

  // Items table
  const tableData = data.items.map((item, i) => [
    i + 1, item.name, item.qty, `₹${item.rate.toFixed(2)}`, `₹${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["#", "Particulars", "Qty", "Rate", "Amount"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [249, 115, 22] },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 15, halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9);
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`₹${data.subtotal.toFixed(2)}`, 195, finalY, { align: "right" });
  if (data.discount > 0) {
    doc.text(`Discount:`, 140, finalY + 5);
    doc.text(`-₹${data.discount.toFixed(2)}`, 195, finalY + 5, { align: "right" });
  }
  if (data.tax > 0) {
    doc.text(`Tax (GST):`, 140, finalY + 10);
    doc.text(`₹${data.tax.toFixed(2)}`, 195, finalY + 10, { align: "right" });
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const totalY = finalY + (data.discount > 0 ? 18 : data.tax > 0 ? 18 : 10);
  doc.text(`TOTAL: ₹${data.total.toFixed(2)}`, 195, totalY, { align: "right" });

  // Payment info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment: ${data.paymentMode.toUpperCase()} · Paid: ₹${data.paidAmount.toFixed(2)}`, 15, totalY + 8);
  if (data.receiptNumber) doc.text(`Receipt: ${data.receiptNumber}`, 15, totalY + 13);

  // Footer
  doc.setFontSize(7);
  doc.text("Thank you for choosing Ayuzee Healthcare. Get well soon!", 105, 280, { align: "center" });
  doc.text("This is a computer-generated invoice.", 105, 284, { align: "center" });

  doc.save(`${data.billNumber}.pdf`);
}

// ─── Prescription PDF ─────────────────────────────────────────────────────────

export interface PrescriptionPdfData {
  patientName: string;
  patientId: string;
  patientAge?: string;
  patientGender?: string;
  doctorName: string;
  doctorQualification?: string;
  doctorRegNo?: string;
  date: string;
  diagnosis?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    anupana?: string;
  }[];
  investigations?: string[];
  dietInstructions?: string;
  specialInstructions?: string;
  followUpDate?: string;
}

export function generatePrescriptionPdf(data: PrescriptionPdfData): void {
  const doc = new jsPDF();
  addHospitalHeader(doc);

  // Rx header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("℞", 15, 38);
  doc.setFontSize(10);
  doc.text("PRESCRIPTION", 25, 38);

  // Patient & Doctor info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient: ${data.patientName} (${data.patientId})`, 15, 46);
  doc.text(`Age/Gender: ${data.patientAge || "—"} / ${data.patientGender || "—"}`, 15, 51);
  doc.text(`Date: ${data.date}`, 150, 46);
  doc.text(`Doctor: ${data.doctorName}`, 150, 51);
  if (data.diagnosis) {
    doc.text(`Diagnosis: ${data.diagnosis}`, 15, 57);
  }

  doc.line(15, 60, 195, 60);

  // Medicines table
  const medData = data.medicines.map((m, i) => [
    i + 1,
    m.name + (m.anupana ? `\n(Anupana: ${m.anupana})` : ""),
    m.dosage,
    m.frequency,
    m.duration,
    m.instructions || "",
  ]);

  autoTable(doc, {
    startY: 63,
    head: [["#", "Medicine", "Dose", "Frequency", "Duration", "Instructions"]],
    body: medData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 139, 34] }, // green for Rx
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 50 } },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Investigations
  if (data.investigations && data.investigations.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Investigations Ordered:", 15, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(data.investigations.join(", "), 15, currentY + 5);
    currentY += 12;
  }

  // Diet
  if (data.dietInstructions) {
    doc.setFont("helvetica", "bold");
    doc.text("Diet (Pathya/Apathya):", 15, currentY);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.dietInstructions, 170);
    doc.text(lines, 15, currentY + 5);
    currentY += 5 + lines.length * 4;
  }

  // Special instructions
  if (data.specialInstructions) {
    doc.setFont("helvetica", "bold");
    doc.text("Special Instructions:", 15, currentY + 3);
    doc.setFont("helvetica", "normal");
    doc.text(data.specialInstructions, 15, currentY + 8);
    currentY += 14;
  }

  // Follow-up
  if (data.followUpDate) {
    doc.setFont("helvetica", "bold");
    doc.text(`Follow-up: ${data.followUpDate}`, 15, currentY + 3);
    currentY += 8;
  }

  // Doctor signature area
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.doctorName, 150, 260);
  if (data.doctorQualification) doc.text(data.doctorQualification, 150, 265);
  if (data.doctorRegNo) doc.text(`Reg: ${data.doctorRegNo}`, 150, 270);
  doc.line(145, 257, 195, 257);

  // Footer
  doc.setFontSize(7);
  doc.text("This is a digitally generated prescription from Ayuzee HMS.", 105, 285, { align: "center" });

  doc.save(`Rx-${data.patientId}-${data.date}.pdf`);
}
