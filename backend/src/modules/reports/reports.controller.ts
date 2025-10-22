import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

const reportsService = new ReportsService();

export const createReport = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { contentId, reason } = req.body;

    if (!contentId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'contentId y reason son obligatorios'
      });
    }

    const report = await reportsService.createReport({
      contentId,
      reporterId: user.id,
      reason
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Reporte creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando reporte:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listReports = async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;

    const resultado = await reportsService.listReports({
      status: status as 'PENDING' | 'APPROVED' | 'REJECTED',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    // El frontend espera directamente el array de reportes
    res.json(resultado.reports);
  } catch (error: any) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status debe ser APPROVED o REJECTED'
      });
    }

    const resultado = await reportsService.updateReportStatus(id, status);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error actualizando reporte:', error);
    res.status(error.message === 'Reporte no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await reportsService.getReportById(id);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error obteniendo reporte:', error);
    res.status(error.message === 'Reporte no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};