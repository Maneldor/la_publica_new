import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import * as ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

// Reutilizar lógica de filtrado de actions (duplicada por simplicidad o importar si se puede)
// Para evitar duplicación, idealmente extraeríamos `buildWhereClause` a un util compartido.
// Por ahora, reconstruyo simple.

const buildWhereClause = (searchParams: URLSearchParams, userId: string) => {
    const where: any = {}

    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const gestorId = searchParams.get('gestorId')
    const companyId = searchParams.get('companyId')
    const leadSource = searchParams.get('leadSource')

    if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    if (gestorId) {
        where.assignedToId = gestorId
    }

    if (companyId) {
        // Buscar company name contains? O ID exacto? Asumumimos ID exacto si viene del filtro, pero el filtro es input texto "Nom empresa".
        // Si el filtro de UI es texto, aquí deberíamos buscar por relación company.name
        // El filtro UI StatisticsFilters tiene: Input placeholder "Nom de l'empresa" -> companyId state.
        // Si companyId es un string de nombre, hay que buscar en company: { name: { contains: ... } }
        // Asumiremos que es búsqueda por nombre
        where.companyName = { contains: companyId, mode: 'insensitive' }
    }

    if (leadSource) {
        where.source = leadSource
    }

    return where
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const formatType = searchParams.get('format') // 'pdf' | 'excel'

    const where = buildWhereClause(searchParams, session.user.id)

    try {
        const leads = await prismaClient.companyLead.findMany({
            where,
            include: {
                assignedTo: { select: { name: true } },
                convertedCompany: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 1000 // Limite de seguridad
        })

        if (formatType === 'excel') {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Estadístiques')

            worksheet.columns = [
                { header: 'Data', key: 'date', width: 15 },
                { header: 'Empresa', key: 'company', width: 30 },
                { header: 'Estat', key: 'status', width: 15 },
                { header: 'Font', key: 'source', width: 15 },
                { header: 'Gestor', key: 'gestor', width: 20 },
                { header: 'Valor Est.', key: 'value', width: 15 },
                { header: 'Conversió', key: 'converted', width: 15 },
            ]

            leads.forEach(lead => {
                worksheet.addRow({
                    date: format(new Date(lead.createdAt), 'dd/MM/yyyy'),
                    company: lead.companyName,
                    status: lead.status,
                    source: lead.source,
                    gestor: lead.assignedTo?.name || '-',
                    value: lead.estimatedValue ? Number(lead.estimatedValue) : 0,
                    converted: lead.convertedAt ? format(new Date(lead.convertedAt), 'dd/MM/yyyy') : '-'
                })
            })

            const buffer = await workbook.xlsx.writeBuffer()

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="estadistiques-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`
                }
            })

        } else if (formatType === 'pdf') {
            // Simple PDF generation
            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Informe d\'Estadístiques i Analítica', 14, 22)

            doc.setFontSize(11)
            doc.text(`Generat el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30)
            doc.text(`Total registres: ${leads.length}`, 14, 36)

            // Headers simplistic manual table
            let y = 50
            doc.setFontSize(10)
            doc.text('Data', 14, y)
            doc.text('Empresa', 40, y)
            doc.text('Estat', 100, y)
            doc.text('Valor', 140, y)
            doc.text('Gestor', 170, y)

            y += 2
            doc.line(14, y, 200, y)
            y += 6

            leads.forEach((lead) => {
                if (y > 280) {
                    doc.addPage()
                    y = 20
                }

                const dateStr = format(new Date(lead.createdAt), 'dd/MM/yyyy')
                const company = lead.companyName.substring(0, 25)
                const status = lead.status
                const value = lead.estimatedValue ? `${lead.estimatedValue}€` : '-'
                const gestor = (lead.assignedTo?.name || '-').substring(0, 15)

                doc.text(dateStr, 14, y)
                doc.text(company, 40, y)
                doc.text(status, 100, y)
                doc.text(value, 140, y)
                doc.text(gestor, 170, y)

                y += 7
            })

            const pdfBuffer = doc.output('arraybuffer')

            return new NextResponse(pdfBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="estadistiques-${format(new Date(), 'yyyy-MM-dd')}.pdf"`
                }
            })

        } else {
            return NextResponse.json({ error: 'Format invàlid' }, { status: 400 })
        }

    } catch (error) {
        console.error('API Export Error:', error)
        return NextResponse.json({ error: 'Error exportant dades' }, { status: 500 })
    }
}
