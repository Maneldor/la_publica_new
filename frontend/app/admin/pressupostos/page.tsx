'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateBudgetPDF, type BudgetData } from '@/lib/pdf/budgetPDF';

// ============================================
// TIPOS
// ============================================

type BudgetStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'INVOICED';
type BudgetItemType = 'PLAN' | 'EXTRA' | 'CUSTOM' | 'DISCOUNT';
type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';

interface Budget {
  id: string;
  budgetNumber: string;
  status: BudgetStatus;
  issueDate: string;
  validUntil: string;
  clientName: string;
  clientEmail: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  company: {
    id: string;
    name: string;
    cif?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  notes?: string;
  items: BudgetItem[];
  invoice?: {
    id: string;
    invoiceNumber: string;
  };
}

interface BudgetItem {
  id: string;
  itemType: BudgetItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  plan?: {
    name: string;
  };
  extra?: {
    name: string;
  };
}

interface Stats {
  total: number;
  byStatus: {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    invoiced: number;
    expired: number;
  };
  amounts: {
    total: number;
    approved: number;
  };
}

// ============================================
// CONSTANTES
// ============================================

const STATUS_CONFIG: Record<BudgetStatus, {
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
    label: 'Enviat',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📤'
  },
  APPROVED: {
    label: 'Aprovat',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  REJECTED: {
    label: 'Rebutjat',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌'
  },
  EXPIRED: {
    label: 'Caducat',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '⏰'
  },
  INVOICED: {
    label: 'Facturat',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '💰'
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PressupostosPage() {
  const router = useRouter();

  // Estados
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función helper para generar PDF del presupuesto
  const handleDownloadBudgetPDF = (budget: Budget) => {
    const budgetData: BudgetData = {
      budgetNumber: budget.budgetNumber,
      date: budget.issueDate,
      validUntil: budget.validUntil,
      client: {
        name: budget.company.name,
        cif: budget.company.cif || '',
        address: budget.company.address || '',
        city: budget.company.city || '',
        postalCode: budget.company.postalCode || '',
        email: budget.clientEmail || '',
      },
      items: budget.items.map(item => ({
        name: item.plan?.name || item.extra?.name || item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100,
        total: item.subtotal / 100,
      })),
      subtotal: budget.subtotal / 100,
      taxRate: 21,
      taxAmount: budget.taxAmount / 100,
      total: budget.total / 100,
      notes: budget.notes || undefined,
      paymentTerms: '• Pagament a 30 dies des de la data de facturació\n• Transferència bancària\n• Els preus inclouen IVA',
    };
    generateBudgetPDF(budgetData);
  };

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal detalle
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // ============================================
  // FUNCIONES API
  // ============================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar presupuestos y stats en paralelo
      const [budgetsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/budgets?status=${statusFilter}`),
        fetch('/api/admin/budgets/stats'),
      ]);

      if (!budgetsRes.ok || !statsRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const budgetsData = await budgetsRes.json();
      const statsData = await statsRes.json();

      setBudgets(budgetsData.budgets || []);
      setStats(statsData.stats || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('¿Aprobar este presupuesto?')) return;

    try {
      const res = await fetch(`/api/admin/budgets/${id}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al aprobar');
      }

      alert('Presupuesto aprobado correctamente');
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al aprobar');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('¿Rechazar este presupuesto?')) return;

    try {
      const res = await fetch(`/api/admin/budgets/${id}/reject`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al rechazar');
      }

      alert('Presupuesto rechazado');
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar');
    }
  };

  const handleConvertToInvoice = async (id: string, budgetNumber: string) => {
    if (!confirm(`¿Convertir ${budgetNumber} en factura?`)) return;

    try {
      const res = await fetch(`/api/admin/budgets/${id}/convert-to-invoice`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al convertir');
      }

      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchData();

      // Redirigir a la factura creada
      if (data.invoice) {
        router.push(`/admin/facturacio/${data.invoice.id}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al convertir');
    }
  };

  const handleDelete = async (id: string, budgetNumber: string) => {
    if (!confirm(`¿Eliminar ${budgetNumber}?`)) return;

    try {
      const res = await fetch(`/api/admin/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar');
      }

      alert('Presupuesto eliminado');
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const viewDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/budgets/${id}`);
      if (!res.ok) throw new Error('Error al cargar detalle');

      const data = await res.json();
      setSelectedBudget(data.budget);
      setShowDetailModal(true);
    } catch (err) {
      alert('Error al cargar detalle');
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

  const getStatusBadge = (status: BudgetStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const filteredBudgets = budgets.filter(budget => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      budget.budgetNumber.toLowerCase().includes(search) ||
      budget.clientName.toLowerCase().includes(search) ||
      budget.company.name.toLowerCase().includes(search)
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
          <h1 className="text-3xl font-bold text-gray-900">Gestió de Pressupostos</h1>
          <p className="text-gray-600 mt-2">
            Crea, gestiona i converteix pressupostos en factures
          </p>
        </div>
        <Link
          href="/admin/pressupostos/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Nou Pressupost
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Pressupostos</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(stats.amounts.total)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">📝 Esborranys</div>
            <div className="text-2xl font-bold text-gray-600">
              {stats.byStatus.draft}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">📤 Enviats</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.byStatus.sent}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">✅ Aprovats</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.approved}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(stats.amounts.approved)}
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
              <option value="SENT">📤 Enviats</option>
              <option value="APPROVED">✅ Aprovats</option>
              <option value="REJECTED">❌ Rebutjats</option>
              <option value="INVOICED">💰 Facturats</option>
              <option value="EXPIRED">⏰ Caducats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Carregant pressupostos...</p>
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
                  # Pressupost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
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
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {budget.budgetNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      Vàlid fins: {formatDate(budget.validUntil)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {budget.company.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {budget.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(budget.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(budget.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      IVA inclòs
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(budget.status)}
                    {budget.invoice && (
                      <div className="text-xs text-gray-500 mt-1">
                        → {budget.invoice.invoiceNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => viewDetails(budget.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Veure
                    </button>

                    {budget.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleApprove(budget.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(budget.id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Rebutjar
                        </button>
                      </>
                    )}

                    {budget.status === 'APPROVED' && !budget.invoice && (
                      <button
                        onClick={() => handleConvertToInvoice(budget.id, budget.budgetNumber)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        Facturar
                      </button>
                    )}

                    {budget.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDelete(budget.id, budget.budgetNumber)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBudgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No s'han trobat pressupostos</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetailModal && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedBudget.budgetNumber}
                  </h2>
                  <p className="text-gray-600">{selectedBudget.company.name}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Información */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Client</div>
                  <div className="font-medium">{selectedBudget.clientName}</div>
                  <div className="text-sm text-gray-500">{selectedBudget.clientEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Estat</div>
                  {getStatusBadge(selectedBudget.status)}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Data emissió</div>
                  <div className="font-medium">{formatDate(selectedBudget.issueDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Vàlid fins</div>
                  <div className="font-medium">{formatDate(selectedBudget.validUntil)}</div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Línies del pressupost</h3>
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
                    {selectedBudget.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.description}</div>
                          {item.plan && (
                            <div className="text-xs text-gray-500">Pla: {item.plan.name}</div>
                          )}
                          {item.extra && (
                            <div className="text-xs text-gray-500">Extra: {item.extra.name}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(item.subtotal)}
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
                      <span className="font-medium">{formatCurrency(selectedBudget.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">IVA (21%):</span>
                      <span className="font-medium">{formatCurrency(selectedBudget.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(selectedBudget.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => handleDownloadBudgetPDF(selectedBudget)}
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

                {selectedBudget.status === 'SENT' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedBudget.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      ✅ Aprovar
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedBudget.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      ❌ Rebutjar
                    </button>
                  </>
                )}

                {selectedBudget.status === 'APPROVED' && !selectedBudget.invoice && (
                  <button
                    onClick={() => {
                      handleConvertToInvoice(selectedBudget.id, selectedBudget.budgetNumber);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    💰 Convertir a Factura
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}