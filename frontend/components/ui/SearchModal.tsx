'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Building2, Tag, User, Loader2, ArrowRight } from 'lucide-react';
import { getCategoryLabel } from '@/lib/constants/categories';

interface SearchResult {
  empreses: Array<{
    id: string;
    name: string;
    logo: string | null;
    logoUrl: string | null;
    sector: string | null;
    slogan: string | null;
    isVerified: boolean;
  }>;
  ofertes: Array<{
    id: string;
    title: string;
    shortDescription: string | null;
    price: number | null;
    originalPrice: number | null;
    featured: boolean;
    company: {
      id: string;
      name: string;
      logo: string | null;
    };
  }>;
  usuaris: Array<{
    id: string;
    name: string | null;
    email: string;
    nick: string | null;
    image: string | null;
    role: string;
    userType: string;
  }>;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl?: string; // Per determinar les URLs segons el context (empresa, dashboard, gestio)
}

export default function SearchModal({ isOpen, onClose, baseUrl = '/dashboard' }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ empreses: [], ofertes: [], usuaris: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input quan s'obre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults({ empreses: [], ofertes: [], usuaris: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ empreses: [], ofertes: [], usuaris: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Error cercant:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Obtenir llista plana de resultats per navegació
  const getAllResults = useCallback(() => {
    const all: Array<{ type: 'empresa' | 'oferta' | 'usuari'; item: any }> = [];
    results.empreses.forEach(e => all.push({ type: 'empresa', item: e }));
    results.ofertes.forEach(o => all.push({ type: 'oferta', item: o }));
    results.usuaris.forEach(u => all.push({ type: 'usuari', item: u }));
    return all;
  }, [results]);

  // Navegació amb teclat
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allResults = getAllResults();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults.length > 0) {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected) {
        navigateTo(selected.type, selected.item);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const navigateTo = (type: 'empresa' | 'oferta' | 'usuari', item: any) => {
    let url = '';
    switch (type) {
      case 'empresa':
        url = `${baseUrl}/empreses/${item.id}`;
        break;
      case 'oferta':
        url = `${baseUrl}/ofertes/${item.id}`;
        break;
      case 'usuari':
        url = `/gestio/usuaris/${item.id}`;
        break;
    }
    router.push(url);
    onClose();
  };

  const totalResults = results.empreses.length + results.ofertes.length + results.usuaris.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
          {/* Input de cerca */}
          <div className="relative border-b border-slate-200">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cercar empreses, ofertes..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Resultats */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : query.length < 2 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-slate-500">Escriu almenys 2 caràcters per cercar</p>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↑↓</kbd> navegar</span>
                  <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Enter</kbd> seleccionar</span>
                  <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Esc</kbd> tancar</span>
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-12 px-4 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No s'han trobat resultats</p>
                <p className="text-slate-400 text-sm mt-1">Prova amb altres termes de cerca</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Empreses */}
                {results.empreses.length > 0 && (
                  <div className="px-2">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Empreses
                    </p>
                    {results.empreses.map((empresa, idx) => {
                      const globalIdx = idx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <button
                          key={empresa.id}
                          onClick={() => navigateTo('empresa', empresa)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {empresa.logo || empresa.logoUrl ? (
                              <img
                                src={empresa.logo || empresa.logoUrl || ''}
                                alt={empresa.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900">{empresa.name}</p>
                            <p className="text-sm text-slate-500 truncate">
                              {getCategoryLabel(empresa.sector || '')}
                            </p>
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Ofertes */}
                {results.ofertes.length > 0 && (
                  <div className="px-2 mt-2">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ofertes
                    </p>
                    {results.ofertes.map((oferta, idx) => {
                      const globalIdx = results.empreses.length + idx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <button
                          key={oferta.id}
                          onClick={() => navigateTo('oferta', oferta)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Tag className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900">{oferta.title}</p>
                            <p className="text-sm text-slate-500 truncate">
                              {oferta.company.name}
                              {oferta.price && ` · ${oferta.price}€`}
                            </p>
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Usuaris */}
                {results.usuaris.length > 0 && (
                  <div className="px-2 mt-2">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Usuaris
                    </p>
                    {results.usuaris.map((usuari, idx) => {
                      const globalIdx = results.empreses.length + results.ofertes.length + idx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <button
                          key={usuari.id}
                          onClick={() => navigateTo('usuari', usuari)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {usuari.image ? (
                              <img
                                src={usuari.image}
                                alt={usuari.name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900">{usuari.name || usuari.nick || 'Usuari'}</p>
                            <p className="text-sm text-slate-500 truncate">{usuari.email}</p>
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer amb dreceres */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">↑↓</kbd> navegar</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">Enter</kbd> obrir</span>
            </div>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">Esc</kbd> tancar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
