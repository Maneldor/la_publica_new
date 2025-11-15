'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  amount: number;
  currency: string;
  description: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  details?: any;
  plan: {
    tier: string;
    monthlyPrice: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    processedAt: string;
    stripePaymentId?: string;
  }>;
}

interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: {
    total: { count: number; amount: number };
    paid: { count: number; total: number };
    pending: { count: number; total: number };
    overdue: { count: number; total: number };
    cancelled: { count: number; total: number };
  };
}

export default function FacturacioPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [invoicesData, setInvoicesData] = useState<InvoicesResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect si no está autenticado
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/login');
    }
  }, [session, status]);

  // Fetch facturas
  const fetchInvoices = async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`/api/empresa/invoices?${params}`);

      if (!response.ok) {
        console.error('API error:', response.status);
        // Set empty state instead of throwing
        setInvoicesData({
          invoices: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          statistics: {
            total: { count: 0, amount: 0 },
            paid: { count: 0, total: 0 },
            pending: { count: 0, total: 0 },
            overdue: { count: 0, total: 0 },
            cancelled: { count: 0, total: 0 }
          }
        });
        return;
      }

      const data = await response.json();
      setInvoicesData(data || {
        invoices: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        },
        statistics: {
          total: { count: 0, amount: 0 },
          paid: { count: 0, total: 0 },
          pending: { count: 0, total: 0 },
          overdue: { count: 0, total: 0 },
          cancelled: { count: 0, total: 0 }
        }
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Set empty state on error
      setInvoicesData({
        invoices: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        },
        statistics: {
          total: { count: 0, amount: 0 },
          paid: { count: 0, total: 0 },
          pending: { count: 0, total: 0 },
          overdue: { count: 0, total: 0 },
          cancelled: { count: 0, total: 0 }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchInvoices(currentPage, statusFilter, searchTerm);
    }
  }, [session, currentPage, statusFilter]);

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices(1, statusFilter, searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Utils
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'PENDING':
        return 'Pendent';
      case 'OVERDUE':
        return 'Vençuda';
      case 'CANCELLED':
        return 'Cancel·lada';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency
    }).format(amount);
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturació</h1>
          <p className="text-gray-600">Gestiona les factures i historial de pagaments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {invoicesData?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoicesData.statistics.total.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {invoicesData.statistics.total.count} factures
                </p>
              </div>
              <Euro className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagades</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoicesData.statistics.paid.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {invoicesData.statistics.paid.count} factures
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendents</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(invoicesData.statistics.pending.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {invoicesData.statistics.pending.count} factures
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vençudes</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(invoicesData.statistics.overdue.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {invoicesData.statistics.overdue.count} factures
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cercar per número de factura..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cercar
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Totes
            </button>
            <button
              onClick={() => handleStatusFilter('PAID')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === 'PAID'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagades
            </button>
            <button
              onClick={() => handleStatusFilter('PENDING')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendents
            </button>
            <button
              onClick={() => handleStatusFilter('OVERDUE')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === 'OVERDUE'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vençudes
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Factura</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Estat</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Import</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Pla</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900">Accions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoicesData?.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{invoice.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border ${getStatusBadgeColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        {invoice.payments.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Pagat: {formatDate(invoice.payments[0].processedAt)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{invoice.plan.tier}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(invoice.plan.monthlyPrice)}/mes
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">{formatDate(invoice.issueDate)}</p>
                        {invoice.dueDate && (
                          <p className="text-xs text-gray-500">
                            Venc: {formatDate(invoice.dueDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Veure factura"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descarregar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {invoicesData?.invoices.map((invoice) => (
                <div key={invoice.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.description}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border ${getStatusBadgeColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {getStatusText(invoice.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Import</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pla</p>
                      <p className="font-medium text-gray-900">{invoice.plan.tier}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data emissió</p>
                      <p className="text-gray-900">{formatDate(invoice.issueDate)}</p>
                    </div>
                    {invoice.payments.length > 0 && (
                      <div>
                        <p className="text-gray-600">Data pagament</p>
                        <p className="text-gray-900">{formatDate(invoice.payments[0].processedAt)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      Veure
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Descarregar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {invoicesData?.invoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cap factura trobada</h3>
                <p className="text-gray-600">
                  {statusFilter || searchTerm
                    ? 'Prova a modificar els filtres de cerca.'
                    : 'Les factures apareixeran aquí quan facis els primers pagaments.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {invoicesData?.pagination && invoicesData.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrant {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, invoicesData.pagination.total)} de {invoicesData.pagination.total} factures
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!invoicesData.pagination.hasPrev}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, invoicesData.pagination.pages) }, (_, i) => {
                let pageNum;
                if (invoicesData.pagination.pages <= 5) {
                  pageNum = i + 1;
                } else {
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(invoicesData.pagination.pages, start + 4);
                  pageNum = start + i;
                  if (pageNum > end) return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!invoicesData.pagination.hasNext}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Següent
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}