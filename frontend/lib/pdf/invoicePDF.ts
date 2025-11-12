import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatCurrency,
  formatDate,
  addHeader,
  addFooter,
  addClientSection,
  getContentWidth,
  checkPageSpace,
  PDF_CONFIG,
  hexToRgb,
  type ClientData,
} from './pdfHelpers';

// ============================================
// INTERFACES Y TIPOS
// ============================================

export interface InvoiceLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePayment {
  date: string;
  amount: number;
  method: string;
  reference?: string;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  client: ClientData;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate: number; // Siempre 21% en España
  taxAmount: number; // Calculado como subtotal * 0.21
  total: number;
  paidAmount: number;
  pendingAmount: number;
  payments?: InvoicePayment[];
  notes?: string;
}

// ============================================
// CONFIGURACIÓN DE ESTADOS
// ============================================

const STATUS_CONFIG: Record<InvoiceStatus, {
  label: string;
  color: [number, number, number];
  bgColor: [number, number, number];
}> = {
  DRAFT: {
    label: 'ESBORRANY',
    color: [75, 85, 99], // text-gray-600
    bgColor: [243, 244, 246], // bg-gray-100
  },
  SENT: {
    label: 'ENVIADA',
    color: [29, 78, 216], // text-blue-700
    bgColor: [219, 234, 254], // bg-blue-100
  },
  PAID: {
    label: 'PAGADA',
    color: [21, 128, 61], // text-green-700
    bgColor: [220, 252, 231], // bg-green-100
  },
  OVERDUE: {
    label: 'VENÇUDA',
    color: [185, 28, 28], // text-red-700
    bgColor: [254, 226, 226], // bg-red-100
  },
  CANCELLED: {
    label: 'CANCEL·LADA',
    color: [75, 85, 99], // text-gray-600
    bgColor: [243, 244, 246], // bg-gray-100
  },
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Genera un PDF de la factura
 */
export function generateInvoicePDF(invoice: InvoiceData): void {
  // Crear documento PDF A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configuración inicial
  let yPos = 0;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = getContentWidth();

  // ============================================
  // HEADER
  // ============================================
  yPos = addHeader(doc, 'FACTURA', invoice.invoiceNumber);

  // ============================================
  // BADGE DE ESTADO
  // ============================================
  yPos = addStatusBadge(doc, invoice.status, yPos);

  // ============================================
  // INFORMACIÓN DE LA FACTURA
  // ============================================
  yPos = addInvoiceInfo(doc, invoice, yPos);

  // ============================================
  // DATOS DEL CLIENTE
  // ============================================
  yPos = addClientSection(doc, invoice.client, yPos);

  // ============================================
  // TABLA DE LÍNEAS
  // ============================================
  yPos = addItemsTable(doc, invoice, yPos);

  // ============================================
  // RECUADRO DE TOTALES
  // ============================================
  yPos = addTotalsSection(doc, invoice, yPos);

  // ============================================
  // HISTORIAL DE PAGOS
  // ============================================
  if (invoice.payments && invoice.payments.length > 0) {
    yPos = addPaymentsHistory(doc, invoice, yPos);
  }

  // ============================================
  // NOTAS
  // ============================================
  if (invoice.notes && invoice.notes.trim()) {
    yPos = addNotesSection(doc, invoice, yPos);
  }

  // ============================================
  // FOOTER
  // ============================================
  addFooter(doc, 1, 1);

  // ============================================
  // DESCARGAR ARCHIVO
  // ============================================
  const fileName = `factura-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Añade badge de estado de la factura
 */
function addStatusBadge(doc: jsPDF, status: InvoiceStatus, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const config = STATUS_CONFIG[status];
  const badgeText = config.label;

  // Configurar fuente para medir el texto
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);

  const textWidth = doc.getTextWidth(badgeText);
  const padding = 6;
  const badgeWidth = textWidth + (padding * 2);
  const badgeHeight = 8;
  const badgeX = pageWidth - PDF_CONFIG.margins.right - badgeWidth;

  // Fondo del badge
  doc.setFillColor(...config.bgColor);
  doc.roundedRect(badgeX, startY - 2, badgeWidth, badgeHeight, 2, 2, 'F');

  // Borde del badge
  doc.setDrawColor(...config.color);
  doc.setLineWidth(0.5);
  doc.roundedRect(badgeX, startY - 2, badgeWidth, badgeHeight, 2, 2);

  // Texto del badge
  doc.setTextColor(...config.color);
  doc.text(badgeText, badgeX + padding, startY + 3);

  return startY + 15;
}

/**
 * Añade información básica de la factura
 */
function addInvoiceInfo(doc: jsPDF, invoice: InvoiceData, startY: number): number {
  let yPos = startY;

  // Configurar fuente
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));

  // Información del lado izquierdo
  const leftInfoX = PDF_CONFIG.margins.left;
  const leftInfo = [
    `Núm. Factura: ${invoice.invoiceNumber}`,
    `Data d'emissió: ${formatDate(invoice.issueDate)}`,
    `Data de venciment: ${formatDate(invoice.dueDate)}`,
  ];

  leftInfo.forEach(line => {
    doc.text(line, leftInfoX, yPos);
    yPos += 6;
  });

  return yPos + 10;
}

/**
 * Añade tabla de líneas de la factura
 */
function addItemsTable(doc: jsPDF, invoice: InvoiceData, startY: number): number {
  // Preparar datos para la tabla
  const tableData = invoice.items.map(item => [
    item.name,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
  ]);

  // Configurar tabla
  autoTable(doc, {
    startY: startY,
    head: [['Concepte', 'Quantitat', 'Preu Unitari', 'Total']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: hexToRgb(PDF_CONFIG.colors.text),
    },
    headStyles: {
      fillColor: hexToRgb(PDF_CONFIG.colors.primary),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' }, // Concepte
      1: { halign: 'center', cellWidth: 20 },   // Quantitat
      2: { halign: 'right', cellWidth: 30 },    // Preu Unitari
      3: { halign: 'right', cellWidth: 30 },    // Total
    },
    alternateRowStyles: {
      fillColor: hexToRgb(PDF_CONFIG.colors.background),
    },
    margin: {
      left: PDF_CONFIG.margins.left,
      right: PDF_CONFIG.margins.right,
    },
  });

  // Retornar posición Y después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
  return finalY + 10;
}

/**
 * Añade recuadro de totales (incluyendo pagado y pendiente)
 */
function addTotalsSection(doc: jsPDF, invoice: InvoiceData, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalsWidth = 60;
  const totalsX = pageWidth - PDF_CONFIG.margins.right - totalsWidth;
  let yPos = startY;

  // Calcular altura del recuadro según si hay pagos
  const hasPayments = invoice.paidAmount > 0;
  const boxHeight = hasPayments ? 50 : 35;

  // Fondo del recuadro de totales
  doc.setFillColor(...hexToRgb(PDF_CONFIG.colors.background));
  doc.rect(totalsX - 5, yPos - 5, totalsWidth + 10, boxHeight, 'F');

  // Borde del recuadro
  doc.setDrawColor(...hexToRgb(PDF_CONFIG.colors.border));
  doc.setLineWidth(0.5);
  doc.rect(totalsX - 5, yPos - 5, totalsWidth + 10, boxHeight);

  // Configurar fuente
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));

  // Líneas de totales
  const totalsLines = [
    { label: 'Subtotal:', value: formatCurrency(invoice.subtotal), bold: false },
    { label: 'IVA (21%):', value: formatCurrency(invoice.taxAmount), bold: false },
    { label: 'TOTAL:', value: formatCurrency(invoice.total), bold: true },
  ];

  // Añadir líneas de pagos si existen
  if (hasPayments) {
    totalsLines.push(
      { label: 'Pagat:', value: formatCurrency(invoice.paidAmount), bold: false },
      { label: 'PENDENT:', value: formatCurrency(invoice.pendingAmount), bold: true }
    );
  }

  totalsLines.forEach(({ label, value, bold }, index) => {
    if (bold) {
      doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
      doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);

      // Color especial para PENDENT si es > 0
      if (label === 'PENDENT:' && invoice.pendingAmount > 0) {
        doc.setTextColor(...STATUS_CONFIG.OVERDUE.color);
      }
    }

    // Label (izquierda)
    doc.text(label, totalsX, yPos);

    // Valor (derecha)
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, totalsX + totalsWidth - valueWidth, yPos);

    if (bold) {
      doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
      doc.setFontSize(PDF_CONFIG.fonts.size.text);
      doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));
    }

    yPos += bold ? 8 : 6;
  });

  return yPos + 15;
}

/**
 * Añade historial de pagos
 */
function addPaymentsHistory(doc: jsPDF, invoice: InvoiceData, startY: number): number {
  let yPos = startY;

  // Verificar espacio disponible
  if (!checkPageSpace(doc, yPos, 60)) {
    doc.addPage();
    yPos = addHeader(doc, 'FACTURA', `${invoice.invoiceNumber} - Pagaments`);
    addFooter(doc, 2, 2);
  }

  // Título de la sección
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));
  doc.text('HISTORIAL DE PAGAMENTS', PDF_CONFIG.margins.left, yPos);
  yPos += 10;

  // Preparar datos para la tabla de pagos
  const paymentsData = invoice.payments!.map(payment => [
    formatDate(payment.date),
    payment.method,
    payment.reference || '-',
    formatCurrency(payment.amount),
  ]);

  // Configurar tabla de pagos
  autoTable(doc, {
    startY: yPos,
    head: [['Data', 'Mètode', 'Referència', 'Import']],
    body: paymentsData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: hexToRgb(PDF_CONFIG.colors.text),
    },
    headStyles: {
      fillColor: hexToRgb(PDF_CONFIG.colors.secondary),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 25 },  // Data
      1: { halign: 'center', cellWidth: 30 },  // Mètode
      2: { halign: 'left', cellWidth: 'auto' }, // Referència
      3: { halign: 'right', cellWidth: 25 },   // Import
    },
    alternateRowStyles: {
      fillColor: hexToRgb(PDF_CONFIG.colors.background),
    },
    margin: {
      left: PDF_CONFIG.margins.left,
      right: PDF_CONFIG.margins.right,
    },
  });

  // Retornar posición Y después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 30;
  return finalY + 10;
}

/**
 * Añade sección de notas
 */
function addNotesSection(doc: jsPDF, invoice: InvoiceData, startY: number): number {
  let yPos = startY;

  // Verificar espacio disponible
  if (!checkPageSpace(doc, yPos, 30)) {
    doc.addPage();
    yPos = addHeader(doc, 'FACTURA', `${invoice.invoiceNumber} - Notes`);
    addFooter(doc, 2, 2);
  }

  // Título de la sección
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));
  doc.text('NOTES', PDF_CONFIG.margins.left, yPos);
  yPos += 8;

  // Contenido de las notas
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);

  const splitNotes = doc.splitTextToSize(invoice.notes!, getContentWidth());
  doc.text(splitNotes, PDF_CONFIG.margins.left, yPos);
  yPos += splitNotes.length * 5;

  return yPos + 10;
}

// ============================================
// FUNCIÓN DE UTILIDAD PARA TESTING
// ============================================

/**
 * Genera una factura de ejemplo para testing
 */
export function generateSampleInvoice(): InvoiceData {
  return {
    invoiceNumber: 'FAC-2024-001',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SENT',
    client: {
      name: 'Empresa Client S.L.',
      cif: 'B87654321',
      address: 'Avinguda Principal, 789',
      city: 'Barcelona',
      postalCode: '08003',
      email: 'facturacio@empresa-client.com',
    },
    items: [
      {
        name: 'Servei de consultoria web',
        description: 'Consultoria especialitzada en desenvolupament',
        quantity: 20,
        unitPrice: 75,
        total: 1500,
      },
      {
        name: 'Disseny UX/UI',
        description: 'Prototips i disseny d\'interfície',
        quantity: 1,
        unitPrice: 1200,
        total: 1200,
      },
    ],
    subtotal: 2700,
    taxRate: 21,
    taxAmount: 567,
    total: 3267,
    paidAmount: 1500,
    pendingAmount: 1767,
    payments: [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1500,
        method: 'Transferència bancària',
        reference: 'TRF-001-2024',
      },
    ],
    notes: 'Aquesta factura correspon als serveis prestats durant el mes de novembre de 2024. El pagament restant té venciment segons les condicions acordades.',
  };
}