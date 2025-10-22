import { User, Users, MessageSquare, Heart, FileText, Upload } from 'lucide-react';

export const statsData = [
  {
    label: 'Perfil Completat',
    value: '85%',
    trend: '+5%',
    icon: User,
    color: '#10b981'
  },
  {
    label: 'Connexions',
    value: '142',
    trend: '+12',
    icon: Users,
    color: '#3b82f6'
  },
  {
    label: 'Posts Publicats',
    value: '23',
    trend: '+3',
    icon: MessageSquare,
    color: '#8b5cf6'
  },
  {
    label: 'Likes Rebuts',
    value: '367',
    trend: '+45',
    icon: Heart,
    color: '#ef4444'
  }
];

export const aboutData = {
  bio: "Funcionari públic apassionat per la innovació tecnològica i la modernització de l'administració. M'especialitzo en transformació digital i processos administratius eficients. Sempre buscant maneres de millorar l'experiència ciutadana a través de la tecnologia.",
  birthDate: '1985-03-15',
  location: 'Barcelona, Catalunya',
  workplace: 'Ajuntament de Barcelona',
  position: 'Tècnic en Transformació Digital',
  website: 'https://jordi-garcia.dev',
  socialNetworks: {
    twitter: '@jordi_garcia',
    linkedin: 'jordi-garcia-martinez',
    instagram: '@jordigarcia_public'
  }
};

export const mockEducation = [
  {
    id: '1',
    title: 'Màster en Administració i Direcció d\'Empreses (MBA)',
    institution: 'ESADE Business School',
    startYear: '2010',
    endYear: '2012',
    description: 'Especialització en Gestió Pública i Transformació Digital'
  },
  {
    id: '2',
    title: 'Grau en Administració i Direcció d\'Empreses',
    institution: 'Universitat Pompeu Fabra',
    startYear: '2003',
    endYear: '2007',
    description: 'Especialitat en Gestió d\'Organitzacions Públiques'
  },
  {
    id: '3',
    title: 'Postgrau en Transformació Digital',
    institution: 'UOC - Universitat Oberta de Catalunya',
    startYear: '2018',
    endYear: '2019',
    description: 'Certificació en tecnologies emergents aplicades al sector públic'
  }
];

export const mockExperience = [
  {
    id: '1',
    position: 'Tècnic en Transformació Digital',
    company: 'Ajuntament de Barcelona',
    startDate: '2015-09',
    endDate: 'Present',
    description: 'Lidero projectes de digitalització de serveis ciutadans. He implementat més de 20 tràmits online, reduint els temps de gestió en un 60%.'
  },
  {
    id: '2',
    position: 'Analista de Processos',
    company: 'Diputació de Barcelona',
    startDate: '2012-03',
    endDate: '2015-08',
    description: 'Optimització de processos administratius i implementació de sistemes de gestió documental electrònica.'
  },
  {
    id: '3',
    position: 'Consultor Junior',
    company: 'Deloitte Public Sector',
    startDate: '2008-01',
    endDate: '2012-02',
    description: 'Assessorament en projectes de modernització administrativa per a diversos organismes públics.'
  }
];

export const mockSkills = [
  'Transformació Digital', 'Gestió de Projectes', 'Administració Electrònica',
  'Lean Management', 'Process Mining', 'React', 'Node.js', 'TypeScript',
  'Power BI', 'Agile', 'Scrum', 'Leadership', 'Change Management', 'UX/UI Design'
];

export const mockInterests = [
  'Innovació Pública', 'Smart Cities', 'Sostenibilitat', 'Ciclisme',
  'Fotografia', 'Tecnologia', 'Política Local', 'Educació Digital'
];

export const mockLanguages = [
  { name: 'Català', level: 'Natiu' },
  { name: 'Castellà', level: 'Natiu' },
  { name: 'Anglès', level: 'Avançat (C1)' },
  { name: 'Francès', level: 'Intermedi (B2)' }
];

export const mockActivities = [
  {
    id: '1',
    type: 'post',
    content: 'Ha publicat: "Nou sistema de cita prèvia digital implementat amb èxit"',
    timestamp: 'fa 2 hores',
    icon: FileText
  },
  {
    id: '2',
    type: 'group',
    content: 'S\'ha unit al grup "Innovació en Administració Pública"',
    timestamp: 'fa 1 dia',
    icon: Users
  },
  {
    id: '3',
    type: 'comment',
    content: 'Ha comentat la publicació de Maria González sobre processos digitals',
    timestamp: 'fa 2 dies',
    icon: MessageSquare
  },
  {
    id: '4',
    type: 'like',
    content: 'Li ha agradat la publicació "Millores en l\'atenció ciutadana"',
    timestamp: 'fa 3 dies',
    icon: Heart
  },
  {
    id: '5',
    type: 'share',
    content: 'Ha compartit l\'article "Futur de l\'administració digital"',
    timestamp: 'fa 5 dies',
    icon: Upload
  }
];

export const mockFriends = [
  { id: '1', name: 'Maria González', nick: 'maria_admin', avatar: '', administration: 'LOCAL' },
  { id: '2', name: 'Carles Puig', nick: 'carles_tech', avatar: '', administration: 'AUTONOMICA' },
  { id: '3', name: 'Anna Soler', nick: 'anna_design', avatar: '', administration: 'LOCAL' },
  { id: '4', name: 'David Martín', nick: 'david_dev', avatar: '', administration: 'CENTRAL' },
  { id: '5', name: 'Laura Vidal', nick: 'laura_pm', avatar: '', administration: 'AUTONOMICA' },
  { id: '6', name: 'Marc Torres', nick: 'marc_frontend', avatar: '', administration: 'LOCAL' }
];

export const mockGroups = [
  { id: '1', name: 'Innovació en Administració', avatar: '', members: 247, lastActivity: 'fa 2 hores', role: 'admin' },
  { id: '2', name: 'Desenvolupadors Frontend', avatar: '', members: 189, lastActivity: 'fa 1 dia', role: 'member' },
  { id: '3', name: 'Transformació Digital', avatar: '', members: 156, lastActivity: 'fa 3 dies', role: 'moderator' },
  { id: '4', name: 'UX/UI Barcelona', avatar: '', members: 234, lastActivity: 'fa 1 setmana', role: 'member' }
];

export const mockOffers = [
  {
    title: 'Ordinadors portàtils recondiconats',
    company: 'TechReuse',
    price: '900€',
    originalPrice: '1200€',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop'
  },
  {
    title: 'Monitors 24" Full HD',
    company: 'DisplayTech',
    price: '150€',
    originalPrice: '200€',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop'
  },
  {
    title: 'Teclats mecànics professionals',
    company: 'KeyboardPro',
    price: '75€',
    originalPrice: '100€',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop'
  },
  {
    title: 'Auriculars Bluetooth Premium',
    company: 'AudioTech',
    price: '120€',
    originalPrice: '160€',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'
  }
];

export const mockBlogPosts = [
  {
    title: 'Guia Completa de Fotografia Digital',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
  },
  {
    title: 'Transformació Digital en l\'Administració',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop'
  },
  {
    title: 'Implementació de Processos Àgils',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
  },
  {
    title: 'UX/UI per Serveis Públics',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=300&h=200&fit=crop'
  }
];