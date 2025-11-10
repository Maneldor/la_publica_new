import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import JSZip from 'jszip';

const prisma = new PrismaClient();

// Función para generar un PDF individual
async function generatePDF(presupuesto: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header de la factura
      doc.fontSize(20).text('FACTURA', 50, 50);
      doc.fontSize(12);

      // Información de La Pública
      doc.text('LA PÚBLICA', 50, 100);
      doc.text('Carrer Exemple, 123', 50, 115);
      doc.text('08000 Barcelona', 50, 130);
      doc.text('NIF: B12345678', 50, 145);

      // Información del cliente
      doc.text('FACTURAR A:', 300, 100);
      doc.text(presupuesto.company.name, 300, 115);
      doc.text(presupuesto.company.address || 'Direcció no especificada', 300, 130);
      doc.text(`NIF: ${presupuesto.company.taxId || 'No especificat'}`, 300, 145);

      // Datos de la factura
      doc.text(`Factura Nº: FAC-${presupuesto.id.substring(0, 8).toUpperCase()}`, 50, 200);
      doc.text(`Data: ${new Date().toLocaleDateString('ca-ES')}`, 50, 215);
      doc.text(`Estat pressupost: ${presupuesto.estado}`, 50, 230);

      // Línea separadora
      doc.moveTo(50, 260).lineTo(550, 260).stroke();

      // Cabecera de la tabla
      let y = 280;
      doc.text('CONCEPTE', 50, y);
      doc.text('PREU UNITARI', 300, y);
      doc.text('IMPORT', 450, y);

      // Línea bajo la cabecera
      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

      y += 30;

      // Base Professional
      doc.text('Pla Professional - Base', 50, y);
      doc.text(`€${presupuesto.basePremium.toFixed(2)}/mes`, 300, y);
      doc.text(`€${presupuesto.basePremium.toFixed(2)}`, 450, y);
      y += 20;

      // Items adicionales
      presupuesto.items.forEach((item: any) => {
        doc.text(item.nombreSnapshot, 50, y);
        doc.text(`€${item.precioSnapshot.toFixed(2)}/mes`, 300, y);
        doc.text(`€${item.precioSnapshot.toFixed(2)}`, 450, y);
        y += 20;
      });

      // Línea separadora antes de totales
      y += 10;
      doc.moveTo(300, y).lineTo(550, y).stroke();
      y += 20;

      // Subtotal
      doc.text('Subtotal:', 350, y);
      doc.text(`€${presupuesto.subtotal.toFixed(2)}`, 450, y);
      y += 15;

      // Descuento por prorrateo si aplica
      if (presupuesto.prorrateo > 0) {
        doc.text('Descompte prorrateo:', 350, y);
        doc.text(`-€${presupuesto.prorrateo.toFixed(2)}`, 450, y);
        y += 15;
      }

      // Total
      doc.fontSize(14).text('TOTAL:', 350, y);
      doc.text(`€${presupuesto.total.toFixed(2)}`, 450, y);

      // Información de pago
      if (presupuesto.metodoPago) {
        y += 40;
        doc.fontSize(12).text('INFORMACIÓ DE PAGAMENT:', 50, y);
        doc.text(`Mètode: ${presupuesto.metodoPago}`, 50, y + 15);
        if (presupuesto.referenciaPago) {
          doc.text(`Referència: ${presupuesto.referenciaPago}`, 50, y + 30);
        }
      }

      // Notas si las hay
      if (presupuesto.notasAdmin || presupuesto.notasEmpresa) {
        y += 60;
        doc.text('NOTES:', 50, y);
        if (presupuesto.notasAdmin) {
          doc.text(`Admin: ${presupuesto.notasAdmin}`, 50, y + 15);
        }
        if (presupuesto.notasEmpresa) {
          doc.text(`Empresa: ${presupuesto.notasEmpresa}`, 50, y + 30);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// POST - Generar factures massives per empresa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId és obligatori' },
        { status: 400 }
      );
    }

    // Obtener todos los presupuestos aprobados/activados de la empresa
    const presupuestos = await prisma.presupuesto.findMany({
      where: {
        companyId: companyId,
        estado: {
          in: ['APROBADO', 'ACTIVADO']
        }
      },
      include: {
        company: true,
        items: true
      }
    });

    if (presupuestos.length === 0) {
      return NextResponse.json(
        { error: 'No hi ha pressupostos aprovats o activats per aquesta empresa' },
        { status: 404 }
      );
    }

    // Crear el ZIP con todas las facturas
    const zip = new JSZip();

    // Generar PDFs para todos los presupuestos
    for (const presupuesto of presupuestos) {
      try {
        const pdfBuffer = await generatePDF(presupuesto);
        const fileName = `factura-${presupuesto.id.substring(0, 8).toUpperCase()}.pdf`;
        zip.file(fileName, pdfBuffer);
      } catch (error) {
        console.error(`Error generant PDF per pressupost ${presupuesto.id}:`, error);
        // Continuar con el siguiente presupuesto en caso de error
      }
    }

    // Generar el ZIP
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    // Actualizar los presupuestos para marcar que se generaron las facturas
    await prisma.presupuesto.updateMany({
      where: {
        id: {
          in: presupuestos.map(p => p.id)
        }
      },
      data: {
        updatedAt: new Date()
        // Aquí podrías añadir campos como fechaFacturacion si los tienes
      }
    });

    const companyName = presupuestos[0]?.company.name || 'empresa';
    const fileName = `factures-${companyName.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().getTime()}.zip`;

    // Devolver el ZIP
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generant factures massives:', error);
    return NextResponse.json(
      { error: 'Error al generar factures massives' },
      { status: 500 }
    );
  }
}