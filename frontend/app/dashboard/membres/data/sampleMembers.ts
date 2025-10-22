export interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
  department: string;
  location: string;
  administration: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
  avatar: string;
  coverImage: string;
  isOnline: boolean;
  lastActive: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus: 'none' | 'connected' | 'pending_sent' | 'pending_received';
  bio: string;
}

export const sampleMembers: Member[] = [
  {
    id: 1,
    username: 'maria_dev',
    name: 'Maria González',
    role: 'Desenvolupadora Senior Frontend',
    department: 'Tecnologia',
    location: 'Barcelona',
    administration: 'LOCAL' as const,
    avatar: '',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop',
    isOnline: true,
    lastActive: '',
    mutualConnections: 12,
    isConnected: false,
    connectionStatus: 'none' as const,
    bio: 'Especialista en React i TypeScript amb 8 anys d\'experiència. M\'agrada crear interfícies d\'usuari intuïtives.'
  },
  {
    id: 2,
    username: 'joan_pm',
    name: 'Joan Martínez',
    role: 'Product Manager',
    department: 'Producte',
    location: 'Girona',
    administration: 'AUTONOMICA' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=150&fit=crop',
    isOnline: false,
    lastActive: 'fa 2 hores',
    mutualConnections: 8,
    isConnected: true,
    connectionStatus: 'connected' as const,
    bio: 'Lidero equips per crear productes digitals que realment importen. Enfocat en UX i dades.'
  },
  {
    id: 3,
    username: 'anna_ux',
    name: 'Anna Soler',
    role: 'UX/UI Designer',
    department: 'Disseny',
    location: 'Barcelona',
    administration: 'LOCAL' as const,
    avatar: '',
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=150&fit=crop',
    isOnline: true,
    lastActive: '',
    mutualConnections: 15,
    isConnected: false,
    connectionStatus: 'pending_sent' as const,
    bio: 'Creant experiències digitals que connecten amb les persones. Especialista en design systems.'
  },
  {
    id: 4,
    username: 'carles_devops',
    name: 'Carles Roca',
    role: 'DevOps Engineer',
    department: 'Tecnologia',
    location: 'Lleida',
    administration: 'CENTRAL' as const,
    avatar: '',
    coverImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=150&fit=crop',
    isOnline: false,
    lastActive: 'ahir',
    mutualConnections: 3,
    isConnected: false,
    connectionStatus: 'pending_received' as const,
    bio: 'Automatització i infraestructura cloud. Sempre buscant maneres de fer els processos més eficients.'
  },
  {
    id: 5,
    username: 'laura_data',
    name: 'Laura Puig',
    role: 'Data Scientist',
    department: 'Analítica',
    location: 'Barcelona',
    administration: 'AUTONOMICA' as const,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=150&fit=crop',
    isOnline: true,
    lastActive: '',
    mutualConnections: 7,
    isConnected: true,
    connectionStatus: 'connected' as const,
    bio: 'Transformo dades en insights accionables. Especialitzada en machine learning i visualització.'
  },
  {
    id: 6,
    username: 'marc_backend',
    name: 'Marc Torres',
    role: 'Backend Developer',
    department: 'Tecnologia',
    location: 'Tarragona',
    administration: 'LOCAL' as const,
    avatar: '',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=150&fit=crop',
    isOnline: false,
    lastActive: 'fa 1 hora',
    mutualConnections: 5,
    isConnected: false,
    connectionStatus: 'none' as const,
    bio: 'APIs robustes i arquitectures escalables. Node.js i Python són les meves eines favorites.'
  },
  {
    id: 7,
    username: 'jordi_funcionari',
    name: 'Jordi García',
    role: 'Tècnic en Transformació Digital',
    department: 'Innovació',
    location: 'Barcelona',
    administration: 'LOCAL' as const,
    avatar: '',
    coverImage: '',
    isOnline: false,
    lastActive: 'fa 1 setmana',
    mutualConnections: 2,
    isConnected: false,
    connectionStatus: 'none' as const,
    bio: 'Funcionari públic apassionat per la innovació tecnològica i la modernització de l\'administració.'
  }
];