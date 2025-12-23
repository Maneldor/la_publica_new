// Mock data compartido para planes
// En una aplicación real, esto vendría de la base de datos

interface PlanConfig {
  id: string;
  planType: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number | null;
  limitesJSON: string;
  caracteristicas: string;
  color: string;
  icono: string;
  orden: number;
  destacado: boolean;
  activo: boolean;
  visible: boolean;
  esSistema: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockPlanes: PlanConfig[] = [
  {
    id: 'plan_1',
    planType: 'STARTER',
    nombre: 'Pla Starter',
    nombreCorto: 'Starter',
    descripcion: 'Perfecte per començar i provar la plataforma',
    precioMensual: 0,
    precioAnual: null,
    limitesJSON: JSON.stringify({
      maxMembers: 1,
      maxStorage: 1,
      maxProjects: 3,
      maxPosts: 50,
      maxAIAgents: 0,
      maxDocuments: 10
    }),
    caracteristicas: JSON.stringify([
      '1 usuari',
      '1GB emmagatzematge',
      '3 projectes',
      '50 posts/mes',
      'Suport bàsic'
    ]),
    color: '#6B7280',
    icono: '🚀',
    orden: 1,
    destacado: false,
    activo: true,
    visible: true,
    esSistema: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_2',
    planType: 'BASIC',
    nombre: 'Pla Bàsic',
    nombreCorto: 'Basic',
    descripcion: 'Ideal per a equips petits',
    precioMensual: 29,
    precioAnual: 290,
    limitesJSON: JSON.stringify({
      maxMembers: 1,
      maxStorage: 10,
      maxProjects: 10,
      maxPosts: 200,
      maxAIAgents: 1,
      maxDocuments: 50
    }),
    caracteristicas: JSON.stringify([
      '1 usuari',
      '10GB emmagatzematge',
      '10 projectes',
      '200 posts/mes',
      '1 agent IA',
      'Suport per email'
    ]),
    color: '#3B82F6',
    icono: '📦',
    orden: 2,
    destacado: false,
    activo: true,
    visible: true,
    esSistema: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_3',
    planType: 'STANDARD',
    nombre: 'Pla Estàndard',
    nombreCorto: 'Standard',
    descripcion: 'Per a equips en creixement',
    precioMensual: 99,
    precioAnual: 990,
    limitesJSON: JSON.stringify({
      maxMembers: 20,
      maxStorage: 50,
      maxProjects: 30,
      maxPosts: 500,
      maxAIAgents: 3,
      maxDocuments: 200
    }),
    caracteristicas: JSON.stringify([
      'Fins a 20 usuaris',
      '50GB emmagatzematge',
      '30 projectes',
      '500 posts/mes',
      '3 agents IA',
      'Suport prioritari'
    ]),
    color: '#8B5CF6',
    icono: '⭐',
    orden: 3,
    destacado: true,
    activo: true,
    visible: true,
    esSistema: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_4',
    planType: 'PREMIUM',
    nombre: 'Pla Premium',
    nombreCorto: 'Premium',
    descripcion: 'Màxima potència',
    precioMensual: 299,
    precioAnual: 2990,
    limitesJSON: JSON.stringify({
      maxMembers: 100,
      maxStorage: 200,
      maxProjects: 100,
      maxPosts: 2000,
      maxAIAgents: 10,
      maxDocuments: 1000
    }),
    caracteristicas: JSON.stringify([
      'Fins a 100 usuaris',
      '200GB emmagatzematge',
      '100 projectes',
      '2000 posts/mes',
      '10 agents IA',
      'Suport 24/7',
      'API access'
    ]),
    color: '#F59E0B',
    icono: '👑',
    orden: 4,
    destacado: false,
    activo: true,
    visible: true,
    esSistema: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan_5',
    planType: 'PROFESSIONAL',
    nombre: 'Pla Professional',
    nombreCorto: 'Professional',
    descripcion: 'Solució avançada amb configuració personalitzada',
    precioMensual: 199,
    precioAnual: 1990,
    limitesJSON: JSON.stringify({
      maxMembers: 50,
      maxStorage: 100,
      maxProjects: 50,
      maxPosts: 1000,
      maxAIAgents: 5,
      maxDocuments: 500
    }),
    caracteristicas: JSON.stringify([
      'Fins a 50 usuaris',
      '100GB emmagatzematge',
      '50 projectes',
      '1000 posts/mes',
      '5 agents IA',
      'Configuració avançada',
      'Extras disponibles'
    ]),
    color: '#10B981',
    icono: '💎',
    orden: 5,
    destacado: false,
    activo: true,
    visible: true,
    esSistema: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export type { PlanConfig };