'use client';

import { useState, useEffect } from 'react';
import { generateInvoicePDF, type InvoiceData } from '@/lib/pdf/invoicePDF';

// ============================================
// TIPOS
// ============================================

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
type PaymentMethod = 'TRANSFER' | 'CARD' | 'CASH' | 'CHECK' | 'OTHER';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  company: {
    id: string;
    name: string;
  };
  items: InvoiceItem[];
  payments: Payment[];
  totalPaid: number;
  pending: number;
  isOverdue: boolean;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  plan?: {
    id: string;
    nombre: string;
  };
  extra?: {
    id: string;
    name: string;
  };
}

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  status: string;
  notes?: string;
}

interface InvoiceStats {
  total: number;
  byStatus: {
    draft: number;
    sent: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  amounts: {
    total: number;
    paid: number;
    pending: number;
    thisMonth: number;
    thisYear: number;
  };
  rates: {
    collection: number;
    overdue: number;
  };
  alerts: {
    overdueCount: number;
    overdueAmount: number;
  };
}

interface PaymentData {
  amount: number;
  method: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

// ============================================
// CONSTANTES
// ============================================

const STATUS_CONFIG: Record<InvoiceStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  DRAFT: {
    label: 'Esborrany',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝'
  },
  SENT: {
    label: 'Enviada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📤'
  },
  PAID: {
    label: 'Pagada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  OVERDUE: {
    label: 'Vençuda',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '⚠️'
  },
  CANCELLED: {
    label: 'Cancel·lada',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '❌'
  },
};

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferència',
  CARD: 'Targeta',
  CASH: 'Efectiu',
  CHECK: 'Xec',
  OTHER: 'Altre',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function FacturacioPage() {
  // Estados
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modales
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Estado del formulario de pago
  const [paymentForm, setPaymentForm] = useState<PaymentData>({
    amount: 0,
    method: 'TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Función helper para generar PDF de la factura
  const handleDownloadInvoicePDF = (invoice: Invoice) => {
    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      client: {
        name: invoice.company.name,
        cif: invoice.company.cif || '',
        address: invoice.company.address || '',
        city: invoice.company.city || '',
        postalCode: invoice.company.postalCode || '',
        email: invoice.clientEmail || '',
      },
      items: invoice.items.map(item => ({
        name: item.plan?.nombre || item.extra?.name || item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100,
        total: item.subtotal / 100,
      })),
      subtotal: invoice.subtotalAmount / 100,
      taxRate: 21,
      taxAmount: invoice.taxAmount / 100,
      total: invoice.totalAmount / 100,
      paidAmount: invoice.paidAmount / 100,
      pendingAmount: invoice.pendingAmount / 100,
      payments: invoice.payments.map(payment => ({
        date: payment.paymentDate,
        amount: payment.amount / 100,
        method: PAYMENT_METHODS[payment.method] || payment.method,
        reference: payment.reference || '',
      })),
      notes: invoice.notes || undefined,
    };
    generateInvoicePDF(invoiceData);
  };

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    fetchData();
  }, [statusFilter, showOverdueOnly]);

  // ============================================
  // FUNCIONES API
  // ============================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (showOverdueOnly) params.append('overdue', 'true');

      // Cargar facturas y stats en paralelo
      const [invoicesRes, statsRes] = await Promise.all([
        fetch(`/api/admin/invoices?${params.toString()}`),
        fetch('/api/admin/invoices/stats'),
      ]);

      if (!invoicesRes.ok || !statsRes.ok) {
        throw new Error('Error al carregar dades');
      }

      const invoicesData = await invoicesRes.json();
      const statsData = await statsRes.json();

      setInvoices(invoicesData.invoices || []);
      setStats(statsData.stats || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowDetailModal(true);
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.pending / 100, // Convertir de centavos a euros
      method: 'TRANSFER',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const registerPayment = async () => {
    if (!selectedInvoice) return;

    try {
      setPaymentLoading(true);

      const paymentData = {
        amount: paymentForm.amount,
        method: paymentForm.method,
        paymentDate: paymentForm.paymentDate,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      };

      const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al registrar pagament');
      }

      const data = await res.json();
      alert(`✅ ${data.message}`);

      setShowPaymentModal(false);
      setShowDetailModal(false);
      fetchData(); // Recargar datos

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al registrar pagament');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)}€`;
  };

  const getStatusBadge = (status: InvoiceStatus, isOverdue: boolean = false) => {
    const config = STATUS_CONFIG[status];
    const actualColor = isOverdue && status !== 'PAID' ? 'text-red-700' : config.color;
    const actualBgColor = isOverdue && status !== 'PAID' ? 'bg-red-100' : config.bgColor;
    const actualIcon = isOverdue && status !== 'PAID' ? '⚠️' : config.icon;
    const actualLabel = isOverdue && status !== 'PAID' ? 'Vençuda' : config.label;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${actualBgColor} ${actualColor}`}>
        {actualIcon} {actualLabel}
      </span>
    );
  };

  const getPaymentProgress = (paid: number, total: number) => {
    const percentage = total > 0 ? (paid / total) * 100 : 0;
    return Math.min(percentage, 100);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(search) ||
      invoice.clientName.toLowerCase().includes(search) ||
      invoice.company.name.toLowerCase().includes(search)
    );
  });

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestió de Factures</h1>
          <p className="text-gray-600 mt-2">
            Consulta i gestiona totes les factures i els seus pagaments
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>🔄</span> Actualitzar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Factures</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(stats.amounts.total)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">✅ Pagades</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.paid}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(stats.amounts.paid)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">⏳ Pendents</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byStatus.pending}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(stats.amounts.pending)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-red-200">
            <div className="text-sm text-gray-600">⚠️ Vençudes</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.alerts.overdueCount}
            </div>
            <div className="text-sm text-red-500 mt-1">
              {formatCurrency(stats.alerts.overdueAmount)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">📅 Aquest Mes</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.amounts.thisMonth)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Taxa cobrament: {stats.rates.collection}%
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar per número o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">Tots els estats</option>
              <option value="DRAFT">📝 Esborranys</option>
              <option value="SENT">📤 Enviades</option>
              <option value="PAID">✅ Pagades</option>
              <option value="CANCELLED">❌ Cancel·lades</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-red-600">Només vençudes</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Carregant factures...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  # Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Imports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={`hover:bg-gray-50 ${invoice.isOverdue ? 'bg-red-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                    {invoice.isOverdue && (
                      <div className="text-xs text-red-600 font-medium">
                        ⚠️ VENÇUDA
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {invoice.company.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-gray-900">
                      📅 {formatDate(invoice.issueDate)}
                    </div>
                    <div className={`text-xs ${invoice.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      ⏰ {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(invoice.totalAmount / 100)}
                    </div>
                    <div className="text-xs text-green-600">
                      Pagat: {formatCurrency(invoice.totalPaid / 100)}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Pendent: {formatCurrency(invoice.pending / 100)}
                    </div>
                    {invoice.totalPaid > 0 && invoice.pending > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{
                            width: `${getPaymentProgress(invoice.totalPaid, invoice.totalAmount)}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status, invoice.isOverdue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => viewDetails(invoice.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Veure
                    </button>

                    {invoice.status !== 'PAID' && invoice.pending > 0 && (
                      <button
                        onClick={() => openPaymentModal(invoice)}
                        className="text-green-600 hover:text-green-900"
                      >
                        💰 Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No s'han trobat factures</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedInvoice.invoiceNumber}
                  </h2>
                  <p className="text-gray-600">{selectedInvoice.company.name}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información izquierda */}
                <div>
                  {/* Información */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Client</div>
                      <div className="font-medium">{selectedInvoice.clientName}</div>
                      <div className="text-sm text-gray-500">{selectedInvoice.clientEmail}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Estat</div>
                      {getStatusBadge(selectedInvoice.status, selectedInvoice.isOverdue)}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Data emissió</div>
                      <div className="font-medium">{formatDate(selectedInvoice.issueDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Data venciment</div>
                      <div className={`font-medium ${selectedInvoice.isOverdue ? 'text-red-600' : ''}`}>
                        {formatDate(selectedInvoice.dueDate)}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">Línies de la factura</h3>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm">Concepte</th>
                          <th className="px-4 py-2 text-right text-sm">Cant.</th>
                          <th className="px-4 py-2 text-right text-sm">Preu</th>
                          <th className="px-4 py-2 text-right text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">
                              <div className="font-medium">{item.description}</div>
                              {item.plan && (
                                <div className="text-xs text-gray-500">Pla: {item.plan.nombre}</div>
                              )}
                              {item.extra && (
                                <div className="text-xs text-gray-500">Extra: {item.extra.name}</div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice / 100)}</td>
                            <td className="px-4 py-2 text-right font-medium">
                              {formatCurrency(item.subtotal / 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totales */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end space-y-2">
                      <div className="w-64">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.subtotalAmount / 100)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">IVA (21%):</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount / 100)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>TOTAL:</span>
                          <span>{formatCurrency(selectedInvoice.totalAmount / 100)}</span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-600">Pagat:</span>
                            <span className="text-green-600 font-medium">
                              {formatCurrency(selectedInvoice.totalPaid / 100)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-yellow-600">Pendent:</span>
                            <span className="text-yellow-600 font-medium">
                              {formatCurrency(selectedInvoice.pending / 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial de pagos derecha */}
                <div>
                  <h3 className="font-bold mb-3">Historial de Pagaments</h3>
                  {selectedInvoice.payments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedInvoice.payments.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{payment.paymentNumber}</div>
                              <div className="text-sm text-gray-600">
                                📅 {formatDate(payment.paymentDate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {formatCurrency(payment.amount / 100)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {PAYMENT_METHODS[payment.method as PaymentMethod]}
                              </div>
                            </div>
                          </div>
                          {payment.reference && (
                            <div className="text-xs text-gray-600">
                              Ref: {payment.reference}
                            </div>
                          )}
                          {payment.notes && (
                            <div className="text-xs text-gray-600 mt-1">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Encara no hi ha pagaments registrats</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                <button
                  onClick={() => handleDownloadInvoicePDF(selectedInvoice)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
                >
                  📄 Descarregar PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Tancar
                </button>

                {selectedInvoice.status !== 'PAID' && selectedInvoice.pending > 0 && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openPaymentModal(selectedInvoice);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    💰 Registrar Pagament
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR PAGO */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Registrar Pagament</h2>
                  <p className="text-gray-600">{selectedInvoice.invoiceNumber}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Total factura:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.totalAmount / 100)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Ja pagat:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedInvoice.totalPaid / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Pendent:</span>
                    <span className="text-yellow-600">
                      {formatCurrency(selectedInvoice.pending / 100)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedInvoice.pending / 100}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mètode de pagament *
                  </label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      method: e.target.value as PaymentMethod
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de pagament
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      paymentDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referència
                  </label>
                  <input
                    type="text"
                    placeholder="Número de transferència, etc."
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      reference: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    placeholder="Comentaris adicionals..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      notes: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={registerPayment}
                  disabled={paymentLoading || paymentForm.amount <= 0 || paymentForm.amount > selectedInvoice.pending / 100}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {paymentLoading ? 'Registrant...' : '💰 Registrar Pagament'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}