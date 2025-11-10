// Catálogo de funcionalidades empresariales
// Cada funcionalidad tiene pricing y metadata para el configurador

export interface EnterpriseFeature {
  key: string;
  name: string;
  description: string;
  basePrice: number;
  setupFee?: number;
  priceModel?: 'monthly' | 'per_unit' | 'one_time';
  value: {
    amount?: number;
    unit?: string;
    enabled?: boolean;
    hours?: number;
    sessions?: number;
    sla?: string;
  };
  icon: string;
  color: string;
  discount?: string;
  minQuantity?: number;
  maxQuantity?: number;
  isActive?: boolean;
}

export interface FeatureCategory {
  [key: string]: EnterpriseFeature[];
}

export const ENTERPRISE_CATALOG: FeatureCategory = {
  // 📦 CATEGORÍA: Storage Extra
  storage: [
    {
      key: 'storage_10gb',
      name: 'Storage +10 GB',
      description: 'Espai addicional per a documents i arxius',
      basePrice: 10,
      value: { amount: 10, unit: 'GB' },
      icon: '💾',
      color: '#3B82F6',
      isActive: true
    },
    {
      key: 'storage_50gb',
      name: 'Storage +50 GB',
      description: 'Paquet gran d\'emmagatzematge',
      basePrice: 40,
      value: { amount: 50, unit: 'GB' },
      icon: '💾',
      color: '#3B82F6',
      discount: '20% vs 5x10GB',
      isActive: true
    },
    {
      key: 'storage_100gb',
      name: 'Storage +100 GB',
      description: 'Emmagatzematge massiu per grans corporacions',
      basePrice: 70,
      value: { amount: 100, unit: 'GB' },
      icon: '💾',
      color: '#3B82F6',
      discount: '30% vs 10x10GB',
      isActive: true
    }
  ],

  // 👥 CATEGORÍA: Miembros Extra
  members: [
    {
      key: 'members_5',
      name: '+5 Membres',
      description: 'Amplia el teu equip amb 5 membres addicionals',
      basePrice: 25,
      priceModel: 'monthly',
      value: { amount: 5, unit: 'membres' },
      icon: '👥',
      color: '#10B981',
      isActive: true
    },
    {
      key: 'members_10',
      name: '+10 Membres',
      description: 'Equip gran per a departaments',
      basePrice: 45,
      value: { amount: 10, unit: 'membres' },
      icon: '👥',
      color: '#10B981',
      discount: '10% vs individual',
      isActive: true
    },
    {
      key: 'members_unlimited',
      name: 'Membres Il·limitats',
      description: 'Sense límit de membres per a grans organitzacions',
      basePrice: 100,
      value: { amount: -1, unit: 'membres' },
      icon: '👥',
      color: '#10B981',
      isActive: true
    }
  ],

  // 🤖 CATEGORÍA: Agentes IA
  ai_agents: [
    {
      key: 'ai_basic',
      name: 'Agent IA Bàsic',
      description: '1 agent IA per generar contingut automàtic',
      basePrice: 30,
      value: { amount: 1, unit: 'agents' },
      icon: '🤖',
      color: '#8B5CF6',
      isActive: true
    },
    {
      key: 'ai_advanced',
      name: 'Pack 3 Agents IA',
      description: '3 agents IA especialitzats en diferents tasques',
      basePrice: 80,
      value: { amount: 3, unit: 'agents' },
      icon: '🤖',
      color: '#8B5CF6',
      discount: '15% vs 3 individuals',
      isActive: true
    },
    {
      key: 'ai_unlimited',
      name: 'Agents IA Il·limitats',
      description: 'Tots els agents IA disponibles',
      basePrice: 150,
      value: { amount: -1, unit: 'agents' },
      icon: '🤖',
      color: '#8B5CF6',
      isActive: true
    }
  ],

  // 📊 CATEGORÍA: Features Premium
  features: [
    {
      key: 'api_access',
      name: 'Accés API',
      description: 'API RESTful completa per a integració amb sistemes externs',
      basePrice: 50,
      value: { enabled: true },
      icon: '🔌',
      color: '#F59E0B',
      isActive: true
    },
    {
      key: 'custom_branding',
      name: 'Branding Personalitzat',
      description: 'Logo, colors corporatius i personalització visual',
      basePrice: 40,
      setupFee: 200,
      value: { enabled: true },
      icon: '🎨',
      color: '#F59E0B',
      isActive: true
    },
    {
      key: 'white_label',
      name: 'White Label Complet',
      description: 'Plataforma completament sense marca La Pública',
      basePrice: 200,
      setupFee: 1000,
      value: { enabled: true },
      icon: '⚪',
      color: '#F59E0B',
      isActive: true
    },
    {
      key: 'sso_saml',
      name: 'Single Sign-On (SAML)',
      description: 'Integració amb Azure AD, Okta, Google Workspace',
      basePrice: 100,
      setupFee: 500,
      value: { enabled: true },
      icon: '🔐',
      color: '#F59E0B',
      isActive: true
    },
    {
      key: 'advanced_analytics',
      name: 'Analytics Avançat',
      description: 'Dashboard personalitzat amb mètriques avançades',
      basePrice: 60,
      value: { enabled: true },
      icon: '📈',
      color: '#F59E0B',
      isActive: true
    }
  ],

  // 🎓 CATEGORÍA: Formación y Soporte
  support: [
    {
      key: 'dedicated_manager',
      name: 'Account Manager Dedicat',
      description: 'Gestor personal assignat exclusivament',
      basePrice: 200,
      value: { enabled: true },
      icon: '👔',
      color: '#EF4444',
      isActive: true
    },
    {
      key: 'onboarding_premium',
      name: 'Onboarding Premium',
      description: 'Sessió de formació personalitzada de 4 hores',
      basePrice: 0,
      setupFee: 800,
      priceModel: 'one_time',
      value: { hours: 4 },
      icon: '🎓',
      color: '#EF4444',
      isActive: true
    },
    {
      key: 'priority_support',
      name: 'Suport Prioritari 24/7',
      description: 'Resposta garantida en menys de 2 hores',
      basePrice: 150,
      value: { sla: '2h' },
      icon: '🚨',
      color: '#EF4444',
      isActive: true
    },
    {
      key: 'training_sessions',
      name: 'Sessions Formació Mensuals',
      description: '2 sessions formatives mensuals per al teu equip',
      basePrice: 100,
      value: { sessions: 2, unit: 'mes' },
      icon: '📚',
      color: '#EF4444',
      isActive: true
    }
  ],

  // 📄 CATEGORÍA: Documentos y Publicaciones
  content: [
    {
      key: 'documents_unlimited',
      name: 'Documents Il·limitats',
      description: 'Sense cap límit en el nombre de documents',
      basePrice: 30,
      value: { amount: -1, unit: 'documents' },
      icon: '📄',
      color: '#06B6D4',
      isActive: true
    },
    {
      key: 'projects_unlimited',
      name: 'Projectes Il·limitats',
      description: 'Crea tots els projectes que necessitis',
      basePrice: 40,
      value: { amount: -1, unit: 'projectes' },
      icon: '📁',
      color: '#06B6D4',
      isActive: true
    },
    {
      key: 'publications_boost',
      name: 'Boost Publicacions',
      description: '50 publicacions mensuals destacades',
      basePrice: 60,
      value: { amount: 50, unit: 'publicacions' },
      icon: '📢',
      color: '#06B6D4',
      isActive: true
    }
  ]
};

// Helpers para trabajar con el catálogo
export function getAllFeatures(): EnterpriseFeature[] {
  return Object.values(ENTERPRISE_CATALOG).flat();
}

export function getFeaturesByCategory(category: string): EnterpriseFeature[] {
  return ENTERPRISE_CATALOG[category] || [];
}

export function findFeatureById(featureId: string): EnterpriseFeature | null {
  for (const category of Object.values(ENTERPRISE_CATALOG)) {
    const feature = category.find(f => f.key === featureId);
    if (feature) return feature;
  }
  return null;
}

export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    storage: 'Storage Extra',
    members: 'Membres Extra',
    ai_agents: 'Agents IA',
    features: 'Features Premium',
    support: 'Formació i Suport',
    content: 'Contingut'
  };
  return names[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    storage: '📦',
    members: '👥',
    ai_agents: '🤖',
    features: '📊',
    support: '🎓',
    content: '📄'
  };
  return icons[category] || '📌';
}

// Calculadora de precios
export interface SelectedFeature {
  featureId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingCalculation {
  basePlanPrice: number;
  featuresSubtotal: number;
  subtotal: number;
  discountAmount: number;
  totalMonthly: number;
  totalAnnual: number;
  setupFees: number;
  annualSavings: number;
}

export function calculatePricing(
  basePlan: 'STANDARD' | 'PREMIUM',
  selectedFeatures: SelectedFeature[],
  discountPercent: number = 0
): PricingCalculation {
  const basePlanPrice = basePlan === 'PREMIUM' ? 149 : 79;
  const featuresSubtotal = selectedFeatures.reduce((sum, f) => sum + f.totalPrice, 0);
  const subtotal = basePlanPrice + featuresSubtotal;
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalMonthly = subtotal - discountAmount;
  const totalAnnual = totalMonthly * 12 * 0.9; // 10% descuento anual
  const annualSavings = (totalMonthly * 12) - totalAnnual;

  const setupFees = selectedFeatures.reduce((sum, f) => {
    const feature = findFeatureById(f.featureId);
    return sum + (feature?.setupFee || 0);
  }, 0);

  return {
    basePlanPrice,
    featuresSubtotal,
    subtotal,
    discountAmount,
    totalMonthly,
    totalAnnual,
    setupFees,
    annualSavings
  };
}

// Plan bases disponibles
export const BASE_PLANS = {
  STANDARD: {
    id: 'STANDARD',
    name: 'Estàndard',
    price: 79,
    description: 'Fins a 3 membres, funcionalitats bàsiques',
    features: [
      'Fins a 3 membres d\'equip',
      'Estadístiques avançades',
      'Suport telefònic',
      '10 ofertes actives/mes',
      '1 Agent IA comercial'
    ]
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 149,
    description: 'Fins a 10 membres, funcionalitats avançades',
    features: [
      'Fins a 10 membres d\'equip',
      'Analítiques completes',
      'Suport prioritari 24/7',
      'Ofertes il·limitades',
      '3 Agents IA avançats',
      'Perfil destacat'
    ]
  }
} as const;