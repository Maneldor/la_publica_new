// Temporarily disabled during PostgreSQL migration
export class ReportsService {
  // Disabled until schema migration is complete

  async createReport(data: any): Promise<any> {
    throw new Error('Reports functionality temporarily disabled during migration');
  }

  async listReports(filters?: any): Promise<any> {
    throw new Error('Reports functionality temporarily disabled during migration');
  }

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    throw new Error('Reports functionality temporarily disabled during migration');
  }

  async getReportById(reportId: string): Promise<any> {
    throw new Error('Reports functionality temporarily disabled during migration');
  }
}