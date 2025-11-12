import jsPDF from 'jspdf';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface PDFConfig {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    border: string;
    background: string;
  };
  fonts: {
    primary: string;
    size: {
      title: number;
      subtitle: number;
      text: number;
      small: number;
    };
  };
  margins: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

export interface CompanyData {
  name: string;
  cif: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  web?: string;
}

export interface ClientData {
  name: string;
  cif?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  email?: string;
}

// ============================================
// CONFIGURACIÓN CORPORATIVA
// ============================================

export const PDF_CONFIG: PDFConfig = {
  colors: {
    primary: '#3B82F6',     // Azul corporativo
    secondary: '#1E40AF',   // Azul oscuro
    text: '#1F2937',        // Gris oscuro
    textLight: '#6B7280',   // Gris medio
    border: '#E5E7EB',      // Gris claro
    background: '#F9FAFB',  // Gris muy claro
  },
  fonts: {
    primary: 'helvetica',
    size: {
      title: 18,
      subtitle: 14,
      text: 10,
      small: 8,
    },
  },
  margins: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 30,
  },
};

// Datos de La Pública (emisor)
export const COMPANY_DATA: CompanyData = {
  name: 'La Pública',
  cif: 'B12345678',
  address: 'Carrer de la Innovació, 123',
  city: 'Barcelona',
  postalCode: '08001',
  phone: '+34 123 456 789',
  email: 'facturacio@lapublica.cat',
  web: 'www.lapublica.cat',
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Formatea un número como moneda europea
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha en formato catalán
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formatea una fecha larga en catalán
 */
export function formatDateLong(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Convierte color hex a RGB para jsPDF
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Añade header corporativo al PDF
 */
export function addHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = PDF_CONFIG.margins.top;

  // Logo y nombre de la empresa (lado izquierdo)
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.title);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.primary));
  doc.text(COMPANY_DATA.name, PDF_CONFIG.margins.left, yPos);
  yPos += 8;

  // Datos de contacto de la empresa
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.small);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.textLight));

  const contactLines = [
    `${COMPANY_DATA.cif} • ${COMPANY_DATA.address}`,
    `${COMPANY_DATA.postalCode} ${COMPANY_DATA.city}`,
    `Tel: ${COMPANY_DATA.phone} • ${COMPANY_DATA.email}`,
  ];

  contactLines.forEach(line => {
    doc.text(line, PDF_CONFIG.margins.left, yPos);
    yPos += 4;
  });

  yPos += 10;

  // Título del documento (centrado)
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.title);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));

  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, yPos);
  yPos += 8;

  // Subtítulo (si existe)
  if (subtitle) {
    doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
    doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
    doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.textLight));

    const subtitleWidth = doc.getTextWidth(subtitle);
    const subtitleX = (pageWidth - subtitleWidth) / 2;
    doc.text(subtitle, subtitleX, yPos);
    yPos += 6;
  }

  // Línea separadora
  yPos += 5;
  doc.setDrawColor(...hexToRgb(PDF_CONFIG.colors.border));
  doc.setLineWidth(0.5);
  doc.line(
    PDF_CONFIG.margins.left,
    yPos,
    pageWidth - PDF_CONFIG.margins.right,
    yPos
  );
  yPos += 10;

  return yPos;
}

/**
 * Añade footer con información legal y número de página
 */
export function addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - PDF_CONFIG.margins.bottom;

  // Línea separadora del footer
  doc.setDrawColor(...hexToRgb(PDF_CONFIG.colors.border));
  doc.setLineWidth(0.5);
  doc.line(
    PDF_CONFIG.margins.left,
    footerY - 10,
    pageWidth - PDF_CONFIG.margins.right,
    footerY - 10
  );

  // Texto legal (izquierda)
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.small);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.textLight));

  const legalText = 'Aquest document té validesa legal segons la Llei 56/2007';
  doc.text(legalText, PDF_CONFIG.margins.left, footerY - 2);

  // Número de página (derecha)
  const pageText = `Pàgina ${pageNumber} de ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(
    pageText,
    pageWidth - PDF_CONFIG.margins.right - pageTextWidth,
    footerY - 2
  );
}

/**
 * Añade sección de datos del cliente
 */
export function addClientSection(
  doc: jsPDF,
  client: ClientData,
  startY: number
): number {
  let yPos = startY;

  // Título de la sección
  doc.setFont(PDF_CONFIG.fonts.primary, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.size.subtitle);
  doc.setTextColor(...hexToRgb(PDF_CONFIG.colors.text));
  doc.text('FACTURAR A:', PDF_CONFIG.margins.left, yPos);
  yPos += 8;

  // Datos del cliente
  doc.setFont(PDF_CONFIG.fonts.primary, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.size.text);

  const clientLines = [
    client.name,
    client.cif ? `NIF/CIF: ${client.cif}` : '',
    client.address || '',
    client.city && client.postalCode ? `${client.postalCode} ${client.city}` : '',
    client.email || '',
  ].filter(line => line.trim() !== '');

  clientLines.forEach(line => {
    doc.text(line, PDF_CONFIG.margins.left, yPos);
    yPos += 5;
  });

  return yPos + 10;
}

/**
 * Calcula el ancho disponible para el contenido
 */
export function getContentWidth(): number {
  return 210 - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right; // A4 width
}

/**
 * Verifica si hay espacio suficiente en la página actual
 */
export function checkPageSpace(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number
): boolean {
  const pageHeight = doc.internal.pageSize.getHeight();
  const availableSpace = pageHeight - currentY - PDF_CONFIG.margins.bottom;
  return availableSpace >= requiredSpace;
}

/**
 * Añade una nueva página con header y footer
 */
export function addNewPage(
  doc: jsPDF,
  title: string,
  pageNumber: number,
  totalPages: number
): number {
  doc.addPage();
  addFooter(doc, pageNumber, totalPages);
  return addHeader(doc, title, `(Continuació - Pàgina ${pageNumber})`);
}