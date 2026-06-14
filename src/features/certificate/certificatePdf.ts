import { jsPDF } from 'jspdf';
import type { Certificate } from '../progress/store';

// Builds a clean, printable landscape certificate. It is explicitly a
// "Certificate of Completion" with no external accreditation claims.
export function downloadCertificate(cert: Certificate): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, 'F');

  doc.setDrawColor(31, 91, 224);
  doc.setLineWidth(3);
  doc.rect(24, 24, width - 48, height - 48);

  doc.setTextColor(31, 91, 224);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text('Certificate of Completion', width / 2, 130, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('This certifies that', width / 2, 185, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(cert.name, width / 2, 225, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(
    `has completed the SQL Mastery certification exam with a score of ${cert.score} out of ${cert.total}.`,
    width / 2,
    265,
    { align: 'center' }
  );

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate ID: ${cert.id}`, width / 2, 320, { align: 'center' });
  doc.text(`Issued: ${new Date(cert.issuedAt).toLocaleDateString()}`, width / 2, 338, {
    align: 'center',
  });
  doc.text('SQL Mastery — practice-first SQL learning', width / 2, 356, { align: 'center' });
  doc.text(
    'This is a certificate of completion and does not represent external accreditation.',
    width / 2,
    height - 50,
    { align: 'center' }
  );

  doc.save(`sql-mastery-certificate-${cert.id}.pdf`);
}
