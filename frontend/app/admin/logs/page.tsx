'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  description: string;
  userName: string;
  userEmail: string;
  userRole: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  changes: any;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

interface LogStats {
  bySeverity: Record<string, number>;
  byAction?: Record<string, number>;
  byEntity?: Record<string, number>;
}

export default function AdminLogsPage() {
  // Estado
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Log seleccionado para detalles
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Cargar logs
  const loadLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (searchQuery) params.append('search', searchQuery);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (selectedEntity !== 'all') params.append('entity', selectedEntity);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/admin/logs?${params}`);

      if (!response.ok) {
        throw new Error('Error al carregar logs');
      }

      const data = await response.json();

      setLogs(data.logs);
      setStats(data.stats);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);

      console.log('✅ Audit logs loaded:', data.logs.length);

    } catch (err) {
      console.error('Error loading logs:', err);
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    loadLogs();
  }, [page, selectedAction, selectedEntity, selectedSeverity, dateFrom, dateTo]);

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadLogs();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Export a CSV
  const exportToCSV = () => {
    const headers = ['Fecha', 'Acción', 'Usuario', 'Entidad', 'Descripción', 'Severidad', 'IP'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString('ca-ES'),
      log.action,
      log.userName,
      log.entity,
      log.description,
      log.severity,
      log.ipAddress || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    console.log('✅ CSV exportat correctament');
  };

  // Helpers
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <Shield className="w-5 h-5 text-red-600" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'ERROR': return 'bg-red-50 text-red-700 border-red-200';
      case 'WARNING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Logs d'Auditoria
        </h1>
        <p className="text-gray-600 mt-2">
          Registre complet d'accions administratives del sistema
        </p>
      </div>

      {/* Estadísticas rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Info</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.bySeverity?.INFO || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Advertències</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.bySeverity?.WARNING || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Errors/Crítics</p>
                <p className="text-2xl font-bold text-red-900">
                  {(stats.bySeverity?.ERROR || 0) + (stats.bySeverity?.CRITICAL || 0)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Acción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acció
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Totes les accions</option>
              <option value="COMPANY_APPROVED">Empresa Aprovada</option>
              <option value="COMPANY_REJECTED">Empresa Rebutjada</option>
              <option value="OFFER_APPROVED">Oferta Aprovada</option>
              <option value="OFFER_REJECTED">Oferta Rebutjada</option>
              <option value="USER_CREATED">Usuari Creat</option>
              <option value="USER_DELETED">Usuari Eliminat</option>
            </select>
          </div>

          {/* Entidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entitat
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Totes les entitats</option>
              <option value="Company">Empresa</option>
              <option value="Offer">Oferta</option>
              <option value="User">Usuari</option>
              <option value="Coupon">Cupó</option>
            </select>
          </div>

          {/* Severidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severitat
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Totes</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Advertència</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Crític</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data des de
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data fins
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <button
            onClick={() => loadLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualitzar
          </button>

          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAction('all');
              setSelectedEntity('all');
              setSelectedSeverity('all');
              setDateFrom('');
              setDateTo('');
              setPage(1);
            }}
            className="ml-auto text-gray-600 hover:text-gray-900"
          >
            Netejar filtres
          </button>
        </div>
      </div>

      {/* Contenido */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {loading && !logs.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hi ha logs
          </h3>
          <p className="text-gray-600">
            No s'han trobat logs amb els filtres seleccionats
          </p>
        </div>
      ) : (
        <>
          {/* Lista de logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severitat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acció
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuari
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripció
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalls
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAction(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {log.userName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Veure més →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrant {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} logs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="px-4 py-2 text-gray-600">
                Pàgina {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Següent
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalles */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalls del Log</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info básica */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Informació Bàsica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data i Hora</p>
                    <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Acció</p>
                    <p className="font-medium">{formatAction(selectedLog.action)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entitat</p>
                    <p className="font-medium">{selectedLog.entity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severitat</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedLog.severity)}`}>
                      {getSeverityIcon(selectedLog.severity)}
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usuario */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Usuari
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedLog.userName}</p>
                  <p className="text-sm text-gray-600">{selectedLog.userEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">Rol: {selectedLog.userRole}</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Descripció
                </h3>
                <p className="text-gray-900">{selectedLog.description}</p>
              </div>

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Metadata
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Changes */}
              {selectedLog.changes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Canvis
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              {/* Info técnica */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Informació Tècnica
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono">{selectedLog.ipAddress || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Agent:</span>
                    <span className="font-mono text-xs break-all max-w-md">
                      {selectedLog.userAgent || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Log:</span>
                    <span className="font-mono text-xs">{selectedLog.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}