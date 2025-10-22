'use client';

import { Anunci, RelatedAd } from '../data/anunciDetailData';
import { AnunciCard } from '@/components/ui/AnunciCard';
import { FileText, List, MapPin, User, Link2, Star, CheckCircle } from 'lucide-react';

interface AnunciContentProps {
  anunci: Anunci;
  relatedAds: RelatedAd[];
  onAuthorClick: () => void;
  onAuthorProfileClick: () => void;
  onAuthorAdsClick: () => void;
  onRelatedAdClick: (slug: string) => void;
}

export const AnunciContent = ({
  anunci,
  relatedAds,
  onAuthorClick,
  onAuthorProfileClick,
  onAuthorAdsClick,
  onRelatedAdClick
}: AnunciContentProps) => {
  return (
    <div className="mt-8 space-y-6">
      {/* Título y descripción */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {anunci.title}
          </h1>
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
            {anunci.category}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            <span>Descripció</span>
          </h2>
          <div className="max-w-none">
            {anunci.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Especificaciones */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <List size={20} className="text-gray-600" />
          <span>Especificacions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(anunci.specifications).map(([key, value]) => (
            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-gray-600" />
          <span>Ubicació</span>
        </h2>
        <p className="text-gray-700 mb-6">{anunci.location}</p>
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Mapa interactiu (Google Maps embed)</p>
        </div>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
          <span>ℹ️</span>
          <span>Ubicació aproximada per privacitat</span>
        </p>
      </div>

      {/* Información del vendedor */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-gray-600" />
          <span>Venedor</span>
        </h2>

        <div className="flex items-start gap-4 mb-6">
          <img
            src={anunci.authorAvatar}
            alt={anunci.author}
            className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={onAuthorClick}
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 m-0">
              <button
                onClick={onAuthorClick}
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-none border-none text-lg font-semibold transition-colors"
              >
                {anunci.author}
              </button>
            </h3>
            <p className="text-gray-600">@{anunci.author.toLowerCase().replace(' ', '_')}</p>
            <p className="text-sm text-gray-600">Membre des de {anunci.authorMemberSince}</p>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 mr-1" fill="currentColor" />
                <span className="font-medium">{anunci.authorRating}</span>
                <span className="text-gray-600 ml-1">({anunci.authorReviews} valoracions)</span>
              </div>
              {anunci.authorVerified && (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={16} />
                  Verificat
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{anunci.authorActiveAds}</div>
            <div className="text-sm text-gray-600">Anuncis actius</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{anunci.authorSalesCompleted}</div>
            <div className="text-sm text-gray-600">Vendes completades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{anunci.authorResponseTime}</div>
            <div className="text-sm text-gray-600">Temps resposta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{anunci.authorRating}/5</div>
            <div className="text-sm text-gray-600">Valoració</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAuthorProfileClick}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium border-none cursor-pointer transition-colors"
          >
            Veure perfil
          </button>
          <button
            onClick={onAuthorAdsClick}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium border-none cursor-pointer transition-colors"
          >
            Més anuncis d'aquest venedor
          </button>
        </div>
      </div>

      {/* Anuncios relacionados */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Link2 size={20} className="text-gray-600" />
          <span>Anuncis similars</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedAds.map((ad) => (
            <div
              key={ad.id}
              onClick={() => onRelatedAdClick(ad.id.toString())}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 overflow-hidden">
                  {ad.title}
                </h3>
                <div className="text-lg font-bold text-green-600 mb-1">
                  {ad.priceType === 'gratuït' ? 'Gratuït' : `${ad.price}€${ad.priceType === 'negociable' ? ' (Neg.)' : ''}`}
                </div>
                <p className="text-sm text-gray-600">{ad.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};