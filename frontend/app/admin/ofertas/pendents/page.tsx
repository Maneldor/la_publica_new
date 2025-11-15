'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Eye, Search, AlertCircle } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  images: string[];
  submittedAt: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  company: {
    id: string;
    name: string;
    email: string;
    logo: string | null;
  };
}

interface Stats {
  pending: number;
  today: number;
  thisWeek: number;
}

export default function OfertasPendentsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [search]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/ofertas/pending?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (offerId: string) => {
    if (!confirm('Estàs segur que vols aprovar aquesta oferta?')) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/ofertas/${offerId}/approve`, {
        method: 'PUT'
      });

      if (response.ok) {
        alert('Oferta aprovada correctament!');
        fetchOffers(); // Reload list
        setSelectedOffer(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al aprovar oferta');
      }
    } catch (error) {
      console.error('Error approving offer:', error);
      alert('Error al aprovar oferta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!selectedOffer) return;
    if (rejectReason.trim().length < 10) {
      alert('El motiu ha de tenir almenys 10 caràcters');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/ofertas/${selectedOffer.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (response.ok) {
        alert('Oferta rebutjada');
        setShowRejectModal(false);
        setSelectedOffer(null);
        fetchOffers(); // Reload list
      } else {
        const error = await response.json();
        alert(error.error || 'Error al rebutjar oferta');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Error al rebutjar oferta');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Fa menys d\'1 hora';
    if (diffHours < 24) return `Fa ${diffHours} hores`;
    if (diffDays === 1) return 'Fa 1 dia';
    return `Fa ${diffDays} dies`;
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ofertes Pendents de Revisió</h1>
        <p className="text-gray-600 mt-1">Revisa i aprova/rebutja les ofertes enviades per empreses</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600 font-medium">Total Pendents</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600 font-medium">Avui</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.today}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 font-medium">Aquesta Setmana</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cercar per títol, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregant ofertes...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hi ha ofertes pendents</h3>
          <p className="text-gray-600">Totes les ofertes han estat revisades! 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-6">
                {/* Image */}
                <div className="flex-shrink-0 w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {offer.images && offer.images.length > 0 ? (
                    <img
                      src={offer.images[0]}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {offer.category.icon} {offer.category.name}
                        </span>
                        <span>•</span>
                        <span className="font-medium">{offer.company.name}</span>
                        <span>•</span>
                        <span className="text-orange-600 font-medium">
                          {formatDate(offer.submittedAt)}
                        </span>
                      </div>
                    </div>

                    {offer.originalPrice && offer.price && offer.originalPrice > offer.price && (
                      <div className="flex-shrink-0 px-4 py-2 bg-red-500 text-white font-bold rounded-lg">
                        -{calculateDiscount(offer.originalPrice, offer.price)}%
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {offer.shortDescription || offer.description}
                  </p>

                  {/* Price */}
                  {offer.price && (
                    <div className="flex items-center gap-3 mb-4">
                      {offer.originalPrice && offer.originalPrice > offer.price && (
                        <span className="text-gray-400 line-through">
                          {formatPrice(offer.originalPrice)}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(offer.price)}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(offer.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprovar
                    </button>

                    <button
                      onClick={() => handleRejectClick(offer)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      Rebutjar
                    </button>

                    <Link
                      href={`/admin/ofertas/${offer.id}`}
                      className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Eye className="w-5 h-5" />
                      Veure Detalls
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Rebutjar Oferta
            </h3>

            <p className="text-gray-600 mb-4">
              Estàs a punt de rebutjar l'oferta "<strong>{selectedOffer.title}</strong>"
              de <strong>{selectedOffer.company.name}</strong>.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motiu del rebuig *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Explica el motiu del rebuig per què l'empresa pugui millorar l'oferta..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínim 10 caràcters ({rejectReason.length}/10)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isProcessing || rejectReason.trim().length < 10}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Rebutjant...' : 'Confirmar Rebuig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}