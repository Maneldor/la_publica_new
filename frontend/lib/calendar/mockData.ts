export interface Event {
  id: string;
  tipus_propietari: 'meu' | 'plataforma';
  categoria: 'curs' | 'assessorament' | 'grup' | 'esdeveniment' | 'recordatori' | 'personalitzat' | 'webinar';

  // Info basica
  titol: string;
  descripcio?: string;
  data_inici: string;
  data_fi: string;
  tot_el_dia?: boolean;

  // Ubicacio
  modalitat: 'hibrid' | 'online' | 'presencial';
  ubicacio?: string;
  link_online?: string;

  // Relacionat amb
  relacionat_id?: string;
  relacionat_tipus?: string;

  // Organitzador/Instructor
  instructor_id?: string;
  instructor_nom?: string;
  organitzador?: string;

  // Visual
  color: string;
  icon: string;

  // Recordatoris
  recordatoris?: Array<{
    temps: number;
    unitat: string;
    enviat: boolean;
  }>;

  // Repeticio
  repetir?: {
    frequencia: 'diari' | 'setmanal' | 'mensual' | 'anual';
    interval: number;
    fins: string;
  };

  // Participants
  participants?: string[];
  participants_count?: number;

  // Materials i objectius
  materials?: string[];
  objectius?: string[];

  // Control
  visible: boolean;
}

export function generateMockEvents(): Event[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const events: Event[] = [];

  // Esdeveniments personals de l'usuari
  events.push({
    id: 'event-1',
    tipus_propietari: 'meu',
    categoria: 'recordatori',
    titol: 'Reunio amb assessor',
    descripcio: 'Reunio programada amb Maria Puig per assessorament legal',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-15T10:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-15T11:00:00`,
    modalitat: 'presencial',
    ubicacio: 'Oficina 3B',
    instructor_nom: 'Maria Puig',
    color: '#ef4444',
    icon: '📅',
    recordatoris: [
      { temps: 15, unitat: 'minuts', enviat: false },
      { temps: 1, unitat: 'hora', enviat: false }
    ],
    visible: true
  });

  events.push({
    id: 'event-2',
    tipus_propietari: 'meu',
    categoria: 'curs',
    titol: 'Curs Excel Avancat - Sessio 2',
    descripcio: 'Continuacio del curs d Excel Avancat',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-20T09:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-20T12:00:00`,
    modalitat: 'hibrid',
    ubicacio: 'Aula 1',
    link_online: 'https://meet.google.com/abc-def-ghi',
    instructor_nom: 'Joan Perez',
    organitzador: 'Centre de Formacio',
    color: '#3b82f6',
    icon: '📚',
    materials: ['Manual Excel Avancat.pdf', 'Exercicis practica.xlsx'],
    objectius: ['Dominar funcions avancades', 'Crear macros basics', 'Analisi de dades'],
    visible: true
  });

  events.push({
    id: 'event-3',
    tipus_propietari: 'meu',
    categoria: 'grup',
    titol: 'Reunio Grup Desenvolupadors',
    descripcio: 'Reunio mensual del grup de desenvolupadors web',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-22T18:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-22T20:00:00`,
    modalitat: 'presencial',
    ubicacio: 'Sala de reunions 2',
    organitzador: 'Grup Desenvolupadors Web',
    participants_count: 12,
    color: '#10b981',
    icon: '👥',
    visible: true
  });

  events.push({
    id: 'event-4',
    tipus_propietari: 'meu',
    categoria: 'personalitzat',
    titol: 'Preparar presentacio',
    descripcio: 'Preparar la presentacio per al projecte de sostenibilitat',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-18T14:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-18T16:00:00`,
    modalitat: 'online',
    color: '#f59e0b',
    icon: '📊',
    visible: true
  });

  events.push({
    id: 'event-5',
    tipus_propietari: 'meu',
    categoria: 'assessorament',
    titol: 'Consultoria financera',
    descripcio: 'Sessio de consultoria sobre gestio financera de projectes',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-25T11:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-25T12:30:00`,
    modalitat: 'online',
    link_online: 'https://zoom.us/j/123456789',
    instructor_nom: 'Pere Soler',
    color: '#8b5cf6',
    icon: '💼',
    visible: true
  });

  events.push({
    id: 'event-6',
    tipus_propietari: 'meu',
    categoria: 'recordatori',
    titol: 'Entregar documentacio',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-28T23:59:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-28T23:59:00`,
    tot_el_dia: true,
    modalitat: 'online',
    color: '#ef4444',
    icon: '⏰',
    recordatoris: [
      { temps: 1, unitat: 'dia', enviat: false },
      { temps: 3, unitat: 'dies', enviat: false }
    ],
    visible: true
  });

  events.push({
    id: 'event-7',
    tipus_propietari: 'meu',
    categoria: 'personalitzat',
    titol: 'Vacances',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-30T00:00:00`,
    data_fi: `${year}-${String(month + 2).padStart(2, '0')}-05T23:59:00`,
    tot_el_dia: true,
    modalitat: 'presencial',
    color: '#06b6d4',
    icon: '🏖️',
    visible: true
  });

  // Esdeveniments de la plataforma

  // Cursos disponibles
  const cursosNoms = ['Excel Avancat', 'Comptabilitat', 'Marketing Digital', 'Gestio de Projectes', 'Lideratge', 'Comunicacio', 'Angles B2', 'Photoshop'];
  const instructorsNoms = ['Anna Serra', 'Marc Vila', 'Laura Costa', 'Joan Roca', 'Marta Font', 'Pere Soler', 'Nuria Pla', 'David Mora'];

  for (let i = 8; i <= 15; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    events.push({
      id: `event-${i}`,
      tipus_propietari: 'plataforma',
      categoria: 'curs',
      titol: `Curs ${cursosNoms[i - 8]}`,
      descripcio: 'Curs disponible per inscriures.',
      data_inici: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${9 + (i % 3) * 3}:00:00`,
      data_fi: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${11 + (i % 3) * 3}:00:00`,
      modalitat: (['online', 'presencial', 'hibrid'] as const)[i % 3],
      ubicacio: i % 2 === 0 ? 'Aula ' + (i - 7) : undefined,
      instructor_nom: instructorsNoms[i - 8],
      organitzador: 'Centre de Formacio',
      participants_count: Math.floor(Math.random() * 50) + 10,
      color: '#60a5fa',
      icon: '📚',
      objectius: ['Aprofundir en conceptes avancats', 'Desenvolupar habilitats practiques', 'Obtenir certificacio oficial'],
      visible: true
    });
  }

  // Webinars
  events.push({
    id: 'event-16',
    tipus_propietari: 'plataforma',
    categoria: 'webinar',
    titol: 'Webinar: IA i Administracio Publica',
    descripcio: 'Descobreix com la Intelligencia Artificial pot transformar la administracio publica.',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-26T17:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-26T18:30:00`,
    modalitat: 'online',
    link_online: 'https://youtube.com/live/xyz',
    organitzador: 'Generalitat de Catalunya',
    participants_count: 234,
    color: '#60a5fa',
    icon: '📢',
    objectius: ['Aplicacions practiques de la IA', 'Casos d exit a Catalunya', 'Reptes ethics i legals'],
    visible: true
  });

  events.push({
    id: 'event-17',
    tipus_propietari: 'plataforma',
    categoria: 'webinar',
    titol: 'Transformacio Digital',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-18T16:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-18T17:30:00`,
    modalitat: 'online',
    organitzador: 'Institut Tecnologic',
    participants_count: 156,
    color: '#60a5fa',
    icon: '📢',
    visible: true
  });

  // Esdeveniments comunitat
  events.push({
    id: 'event-18',
    tipus_propietari: 'plataforma',
    categoria: 'esdeveniment',
    titol: 'Fira de la Ocupacio',
    descripcio: 'Gran fira amb empreses locals i oportunitats laborals.',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-29T09:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-29T18:00:00`,
    modalitat: 'presencial',
    ubicacio: 'Palau de Congressos',
    organitzador: 'Ajuntament',
    participants_count: 450,
    color: '#60a5fa',
    icon: '🎪',
    visible: true
  });

  events.push({
    id: 'event-19',
    tipus_propietari: 'plataforma',
    categoria: 'esdeveniment',
    titol: 'Networking Emprenedors',
    data_inici: `${year}-${String(month + 1).padStart(2, '0')}-17T18:00:00`,
    data_fi: `${year}-${String(month + 1).padStart(2, '0')}-17T21:00:00`,
    modalitat: 'presencial',
    ubicacio: 'Hub Barcelona',
    organitzador: 'Barcelona Activa',
    participants_count: 89,
    color: '#60a5fa',
    icon: '🤝',
    visible: true
  });

  // Reunions grups (no membre)
  const grupsNoms = ['Sostenibilitat', 'Innovacio', 'Cultura', 'Esports', 'Voluntariat', 'Tecnologia'];
  for (let i = 20; i <= 25; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    const grupNom = grupsNoms[i - 20];
    events.push({
      id: `event-${i}`,
      tipus_propietari: 'plataforma',
      categoria: 'grup',
      titol: `Reunio ${grupNom}`,
      data_inici: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T18:00:00`,
      data_fi: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T20:00:00`,
      modalitat: 'presencial',
      ubicacio: 'Sala ' + (i - 19),
      organitzador: `Grup ${grupNom}`,
      participants_count: Math.floor(Math.random() * 30) + 5,
      color: '#60a5fa',
      icon: '👫',
      visible: true
    });
  }

  return events;
}