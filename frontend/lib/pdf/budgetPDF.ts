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

export interface BudgetLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetData {
  budgetNumber: string;
  date: string;
  validUntil: string;
  client: ClientData;
  items: BudgetLineItem[];
  subtotal: number;
  taxRate: number; // Siempre 21% en España
  taxAmount: number; // Calculado como subtotal * 0.21
  total: number;
  notes?: string;
  paymentTerms?: string;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Genera un PDF del presupuesto
 */
export function generateBudgetPDF(budget: BudgetData): void {
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
  yPos = addHeader(doc, 'PRESSUPOST', budget.budgetNumber);

  // ============================================
  // INFORMACIÓN DEL PRESUPUESTO
  // ============================================
  yPos = addBudgetInfo(doc, budget, yPos);

  // ============================================
  // DATOS DEL CLIENTE
  // ============================================
  yPos = addClientSection(doc, budget.client, yPos);

  // ============================================
  // TABLA DE LÍNEAS
  // ============================================
  yPos = addItemsTable(doc, budget, yPos);

  // ============================================
  // RECUADRO DE TOTALES
  // ============================================
  yPos = addTotalsSection(doc, budget, yPos);

  // ============================================
  // CONDICIONES Y NOTAS
  // ============================================
  yPos = addConditionsSection(doc, budget, yPos);

  // ============================================
  // FOOTER
  // ============================================
  addFooter(doc, 1, 1);

  // ============================================
  // DESCARGAR ARCHIVO
  // ============================================
  const fileName = `pressupost-${budget.budgetNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Añade información básica del presupuesto
 */
function addBudgetInfo(doc: jsPDF, budget: BudgetData, startY: number): number {
  let yPos = startY;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Configurar fuente para información del presupuesto
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));

  // Información del lado izquierdo
  const leftInfoX = PDF_CONFIG.margins.left;
  const leftInfo = [
    `Núm. Pressupost: ${budget.budgetNumber}`,
    `Data: ${formatDate(budget.date)}`,
    `Vàlid fins: ${formatDate(budget.validUntil)}`,
  ];

  leftInfo.forEach(line => {
    doc.text(line, leftInfoX, yPos);
    yPos += 6;
  });

  return yPos + 10;
}

/**
 * Añade tabla de líneas del presupuesto
 */
function addItemsTable(doc: jsPDF, budget: BudgetData, startY: number): number {
  // Preparar datos para la tabla
  const tableData = budget.items.map(item => [
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
 * Añade recuadro de totales
 */
function addTotalsSection(doc: jsPDF, budget: BudgetData, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalsWidth = 60;
  const totalsX = pageWidth - PDF_CONFIG.margins.right - totalsWidth;
  let yPos = startY;

  // Fondo del recuadro de totales
  doc.setFillColor(...hexToRgb(PDF_CONFIG.colors.background));
  doc.rect(totalsX - 5, yPos - 5, totalsWidth + 10, 35, 'F');

  // Borde del recuadro
  doc.setDrawColor(...hexToRgb(PDF_CONFIG.colors.border));
  doc.setLineWidth(0.5);
  doc.rect(totalsX - 5, yPos - 5, totalsWidth + 10, 35);

  // Configurar fuente
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));

  // Líneas de totales
  const totalsLines = [
    { label: 'Subtotal:', value: formatCurrency(budget.subtotal), bold: false },
    { label: 'IVA (21%):', value: formatCurrency(budget.taxAmount), bold: false },
    { label: 'TOTAL:', value: formatCurrency(budget.total), bold: true },
  ];

  totalsLines.forEach(({ label, value, bold }, index) => {
    if (bold) {
      doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
      doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
    }

    // Label (izquierda)
    doc.text(label, totalsX, yPos);

    // Valor (derecha)
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, totalsX + totalsWidth - valueWidth, yPos);

    if (bold) {
      doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
      doc.setFontSize(PDF_CONFIG.fonts.size.text);
    }

    yPos += bold ? 8 : 6;
  });

  return yPos + 15;
}

/**
 * Añade sección de condiciones y notas
 */
function addConditionsSection(doc: jsPDF, budget: BudgetData, startY: number): number {
  let yPos = startY;

  // Verificar espacio disponible
  if (!checkPageSpace(doc, yPos, 50)) {
    doc.addPage();
    yPos = addHeader(doc, 'PRESSUPOST', `${budget.budgetNumber} - Condicions`);
    addFooter(doc, 2, 2);
  }

  // ============================================
  // CONDICIONES DE PAGO
  // ============================================
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));
  doc.text('CONDICIONS DE PAGAMENT', PDF_CONFIG.margins.left, yPos);
  yPos += 8;

  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);

  const defaultPaymentTerms = budget.paymentTerms ||
    '• Pagament a 30 dies des de la data de facturació\n' +
    '• Transferència bancària o domiciliació\n' +
    '• Els preus inclouen IVA';

  const paymentLines = defaultPaymentTerms.split('\n');
  paymentLines.forEach(line => {
    if (line.trim()) {
      doc.text(line, PDF_CONFIG.margins.left, yPos);
      yPos += 5;
    }
  });

  yPos += 10;

  // ============================================
  // VALIDESA DEL PRESSUPOST
  // ============================================
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
  doc.text('VALIDESA', PDF_CONFIG.margins.left, yPos);
  yPos += 8;

  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);

  const validityText = `Aquest pressupost té validesa fins al ${formatDate(budget.validUntil)}. ` +
    'Passat aquest termini, els preus podran ser revisats.';

  const splitValidityText = doc.splitTextToSize(validityText, getContentWidth());
  doc.text(splitValidityText, PDF_CONFIG.margins.left, yPos);
  yPos += splitValidityText.length * 5 + 10;

  // ============================================
  // NOTAS ADICIONALES
  // ============================================
  if (budget.notes && budget.notes.trim()) {
    doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
    doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
    doc.text('NOTES ADDICIONALS', PDF_CONFIG.margins.left, yPos);
    yPos += 8;

    doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
    doc.setFontSize(PDF_CONFIG.fonts.size.text);

    const splitNotes = doc.splitTextToSize(budget.notes, getContentWidth());
    doc.text(splitNotes, PDF_CONFIG.margins.left, yPos);
    yPos += splitNotes.length * 5;
  }

  return yPos + 10;
}

// ============================================
// FUNCIÓN DE UTILIDAD PARA TESTING
// ============================================

/**
 * Genera un presupuesto de ejemplo para testing
 */
export function generateSampleBudget(): BudgetData {
  return {
    budgetNumber: 'PRES-2024-001',
    date: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: 'Empresa Demo S.L.',
      cif: 'B12345678',
      address: 'Carrer Exemple, 456',
      city: 'Barcelona',
      postalCode: '08002',
      email: 'contacte@empresa-demo.com',
    },
    items: [
      {
        name: 'Desenvolupament web corporatiu',
        description: 'Pàgina web responsive amb CMS',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
      },
      {
        name: 'Disseny logotip i identitat',
        description: 'Logotip i manual d\'identitat corporativa',
        quantity: 1,
        unitPrice: 800,
        total: 800,
      },
      {
        name: 'Hosting i manteniment anual',
        description: 'Servidor i manteniment per 12 mesos',
        quantity: 1,
        unitPrice: 300,
        total: 300,
      },
    ],
    subtotal: 3600,
    taxRate: 21,
    taxAmount: 756,
    total: 4356,
    notes: 'El projecte inclou 3 revisions del disseny i formació bàsica per a la gestió del contingut.',
    paymentTerms: '• 50% a l\'inici del projecte\n• 50% a la finalització\n• Transferència bancària',
  };
}