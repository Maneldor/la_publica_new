'use client';

import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users2,
  UserPlus,
  Calendar,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Plus,
  Info,
  Lock,
  Globe,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GroupCard } from '@/components/ui/GroupCard';

// Tipus per als grups
interface Group {
  id: number;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  coverImage: string;
  membersCount: number;
  postsCount: number;
  lastActivity: string;
  isMember: boolean;
  isAdmin: boolean;
  adminName: string;
  tags: string[];
  membershipStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  joinRequestDate?: string;
}

// Dades d'exemple de grups
const sampleGroups: Group[] = [
  {
    id: 1,
    name: 'Desenvolupadors Frontend',
    description: 'Comunitat de desenvolupadors especialitzats en tecnologies frontend: React, Vue, Angular, TypeScript i les últimes tendències en desenvolupament web.',
    category: 'Tecnologia',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    membersCount: 247,
    postsCount: 89,
    lastActivity: 'fa 2 hores',
    isMember: true,
    isAdmin: false,
    adminName: 'Marc Torres',
    tags: ['React', 'TypeScript', 'Frontend']
  },
  {
    id: 2,
    name: 'Disseny UX/UI',
    description: 'Grup dedicat al disseny d\'experiències d\'usuari i interfícies. Compartim recursos, tècniques i metodologies per crear productes digitals centrats en l\'usuari.',
    category: 'Disseny',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
    membersCount: 189,
    postsCount: 156,
    lastActivity: 'fa 1 hora',
    isMember: false,
    isAdmin: false,
    adminName: 'Anna Soler',
    tags: ['UX', 'UI', 'Figma']
  },
  {
    id: 3,
    name: 'Marketing Digital',
    description: 'Estratègies de màrqueting digital, SEO, SEM, xarxes socials i analítica. Ideal per professionals que volen estar al dia amb les últimes tendències.',
    category: 'Marketing',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
    membersCount: 324,
    postsCount: 201,
    lastActivity: 'fa 30 min',
    isMember: true,
    isAdmin: false,
    adminName: 'Laura Puig',
    tags: ['SEO', 'Analytics', 'Social Media']
  },
  {
    id: 4,
    name: 'Emprenedors Catalunya',
    description: 'Xarxa d\'emprenedors i startups catalanes. Compartim experiències, busquem col·laboracions i donem suport mutu en els nostres projectes empresarials.',
    category: 'Negocis',
    privacy: 'private',
    coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop',
    membersCount: 156,
    postsCount: 78,
    lastActivity: 'ahir',
    isMember: false,
    isAdmin: false,
    adminName: 'Joan Martínez',
    tags: ['Startup', 'Networking', 'Inversió'],
    membershipStatus: 'pending',
    joinRequestDate: '2025-10-10T10:00:00Z'
  },
  {
    id: 5,
    name: 'Data Science & AI',
    description: 'Grup per a professionals de la ciència de dades, machine learning i intel·ligència artificial. Compartim datasets, algoritmes i casos d\'ús reals.',
    category: 'Tecnologia',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    membersCount: 198,
    postsCount: 134,
    lastActivity: 'fa 3 hores',
    isMember: true,
    isAdmin: false,
    adminName: 'Carla Roca',
    tags: ['Python', 'Machine Learning', 'AI']
  },
  {
    id: 6,
    name: 'Consultors Senior',
    description: 'Grup exclusiu per a consultors amb més de 5 anys d\'experiència. Compartim oportunitats de negoci, millors pràctiques i estratègies de creixement.',
    category: 'Consultoria',
    privacy: 'private',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
    membersCount: 89,
    postsCount: 45,
    lastActivity: 'fa 1 dia',
    isMember: false,
    isAdmin: false,
    adminName: 'Maria González',
    tags: ['Consultoria', 'Strategy', 'Business']
  },
  {
    id: 7,
    name: 'Formació Contínua',
    description: 'Espai per compartir recursos de formació, cursos, certificacions i oportunitats d\'aprenentatge continu per al desenvolupament professional.',
    category: 'Educació',
    privacy: 'public',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    membersCount: 278,
    postsCount: 167,
    lastActivity: 'fa 4 hores',
    isMember: false,
    isAdmin: false,
    adminName: 'David Ferrer',
    tags: ['Formació', 'Cursos', 'Certificacions']
  },
  {
    id: 8,
    name: 'Innovació R&D',
    description: 'Grup per a professionals de recerca i desenvolupament. Exploram noves tecnologies, metodologies d\'innovació i projectes de futur.',
    category: 'Recerca',
    privacy: 'secret',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
    membersCount: 67,
    postsCount: 34,
    lastActivity: 'fa 2 dies',
    isMember: false,
    isAdmin: false,
    adminName: 'Elena Vidal',
    tags: ['R&D', 'Innovació', 'Tecnologia']
  }
];

// Definició de tabs
const tabs = [
  {
    id: 'myGroups',
    label: 'Els Meus',
    description: 'Grups dels quals ets membre'
  },
  {
    id: 'public',
    label: 'Grups Públics',
    description: 'Grups públics accessibles per tothom'
  },
  {
    id: 'professional',
    label: 'Grups Professionals',
    description: 'Grups professionals per àrees de treball'
  }
];

export default function GrupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('myGroups');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    privacy: '',
    members: '',
    activity: ''
  });

  // Stats amb icones
  const stats = [
    {
      label: 'Total Grups',
      value: '89',
      trend: '+5%',
      icon: <Users2 className="w-5 h-5" />,
      color: 'blue' as const
    },
    {
      label: 'Els Meus Grups',
      value: '7',
      trend: '+2',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      label: 'Nous Aquest Mes',
      value: '12',
      trend: '+4',
      icon: <Calendar className="w-5 h-5" />,
      color: 'indigo' as const
    },
    {
      label: 'Membres Total',
      value: '3.2K',
      trend: '+22%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'amber' as const
    }
  ];

  // Filtrar grups
  const filteredGroups = useMemo(() => {
    let filtered = [...sampleGroups];

    // Filtrar per terme de cerca
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar per filtres
    if (filters.category) {
      filtered = filtered.filter(group =>
        group.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.privacy) {
      filtered = filtered.filter(group => group.privacy === filters.privacy);
    }
    if (filters.members) {
      switch (filters.members) {
        case 'small':
          filtered = filtered.filter(group => group.membersCount <= 50);
          break;
        case 'medium':
          filtered = filtered.filter(group => group.membersCount > 50 && group.membersCount <= 200);
          break;
        case 'large':
          filtered = filtered.filter(group => group.membersCount > 200);
          break;
      }
    }

    // Filtrar per tab actiu
    switch (activeTab) {
      case 'myGroups':
        filtered = filtered.filter(group => group.isMember);
        break;
      case 'public':
        filtered = filtered.filter(group => group.privacy === 'public');
        break;
      case 'professional':
        filtered = filtered.filter(group => group.privacy === 'private');
        break;
      default:
        filtered = filtered.filter(group => group.isMember);
        break;
    }

    return filtered;
  }, [searchTerm, filters, activeTab]);

  // Comptar grups per tabs
  const tabCounts = {
    myGroups: sampleGroups.filter(g => g.isMember).length,
    public: sampleGroups.filter(g => g.privacy === 'public').length,
    professional: sampleGroups.filter(g => g.privacy === 'private').length
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', privacy: '', members: '', activity: '' });
  };

  const handleCreateGroup = () => {
    router.push('/dashboard/grups/crear');
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'myGroups': return 'Els Meus Grups';
      case 'public': return 'Grups Públics';
      case 'professional': return 'Grups Professionals';
      default: return 'Tots els Grups';
    }
  };

  return (
    <PageLayout
      title="Grups"
      subtitle="Uneix-te a comunitats d'interès professional"
      icon={<Users2 className="w-6 h-6" />}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Barra de cerca i filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Input de cerca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar grups per nom, descripció o categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Botó de filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>

            {/* Comptador de resultats */}
            <span className="px-4 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 font-medium">
              {filteredGroups.length} grups
            </span>
          </div>

          {/* Panel de filtres expandible */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Filtre per categoria */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Totes les categories</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="disseny">Disseny</option>
                    <option value="marketing">Marketing</option>
                    <option value="negocis">Negocis</option>
                    <option value="educacio">Educació</option>
                    <option value="recerca">Recerca</option>
                  </select>
                </div>

                {/* Filtre per privacitat */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Privacitat
                  </label>
                  <select
                    value={filters.privacy}
                    onChange={(e) => handleFilterChange('privacy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tots els tipus</option>
                    <option value="public">Públics</option>
                    <option value="private">Privats</option>
                    <option value="secret">Secrets</option>
                  </select>
                </div>

                {/* Filtre per mida */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mida del grup
                  </label>
                  <select
                    value={filters.members}
                    onChange={(e) => handleFilterChange('members', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Qualsevol mida</option>
                    <option value="small">Petit (1-50 membres)</option>
                    <option value="medium">Mitjà (51-200 membres)</option>
                    <option value="large">Gran (201+ membres)</option>
                  </select>
                </div>

                {/* Filtre per activitat */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Activitat
                  </label>
                  <select
                    value={filters.activity}
                    onChange={(e) => handleFilterChange('activity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Qualsevol activitat</option>
                    <option value="very_active">Molt actiu</option>
                    <option value="active">Actiu</option>
                    <option value="quiet">Tranquil</option>
                  </select>
                </div>
              </div>

              {/* Botó netejar filtres */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Netejar filtres
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[tab.id as keyof typeof tabCounts]}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 text-center italic">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header de resultats amb toggle vista */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{getSectionTitle()}</h2>
          <p className="text-sm text-gray-500">{filteredGroups.length} grups trobats</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botó Sol·licitar Grup */}
          <button
            onClick={handleCreateGroup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Sol·licitar Grup
          </button>

          {/* Toggle vista */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Vista:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info box per "Els Meus" */}
      {activeTab === 'myGroups' && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Aquests són els grups dels quals ets membre
          </p>
        </div>
      )}

      {/* Grid/Llista de grups */}
      {filteredGroups.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'space-y-3'
        }>
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Users2 className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No s'han trobat grups
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Prova a ajustar els filtres o el terme de cerca per trobar el que busques
          </p>
        </div>
      )}
    </PageLayout>
  );
}
