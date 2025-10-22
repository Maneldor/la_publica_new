// Tipus per als anuncis
export interface Anunci {
  id: number;
  title: string;
  description: string;
  type: 'oferta' | 'demanda';
  category: string;
  price: number;
  priceType: 'fix' | 'negociable' | 'gratuït';
  location: string;
  images: string[];
  author: string;
  authorAvatar: string;
  authorDepartment: string;
  contactPhone: string;
  contactEmail: string;
  status: 'actiu' | 'reservat' | 'tancat';
  createdAt: string;
  expiresAt: string;
  views: number;
  favorites: number;
  isFavorite: boolean;
}

// Dades d'exemple d'anuncis
export const sampleAnuncis: Anunci[] = [
  {
    id: 1,
    title: 'Ordinadors de sobretaula Dell OptiPlex',
    description: 'Lot de 15 ordinadors Dell OptiPlex 7080, Intel i5, 8GB RAM, 256GB SSD. En perfecte estat, renovació d\'equips del departament. Inclou monitor, teclat i ratolí.',
    type: 'oferta',
    category: 'Tecnologia',
    price: 3500,
    priceType: 'negociable',
    location: 'Barcelona',
    images: [
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop'
    ],
    author: 'Josep Martínez',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Informàtica',
    contactPhone: '93 123 45 67',
    contactEmail: 'josep.martinez@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 2 dies',
    expiresAt: 'd\'aquí 28 dies',
    views: 245,
    favorites: 12,
    isFavorite: false
  },
  {
    id: 2,
    title: 'Busco servei de formació en contractació pública',
    description: 'Necessitem un formador expert en la nova llei de contractes del sector públic per impartir un curs de 20 hores al nostre departament.',
    type: 'demanda',
    category: 'Serveis Professionals',
    price: 2000,
    priceType: 'fix',
    location: 'Girona',
    images: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'
    ],
    author: 'Maria Puig',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Recursos Humans',
    contactPhone: '972 12 34 56',
    contactEmail: 'maria.puig@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 1 dia',
    expiresAt: 'd\'aquí 15 dies',
    views: 89,
    favorites: 5,
    isFavorite: true
  },
  {
    id: 3,
    title: 'Mobiliari d\'oficina en bon estat',
    description: 'Per renovació d\'espais, oferim 20 taules d\'oficina, 30 cadires ergonòmiques i 5 armaris arxivadors. Tot en molt bon estat.',
    type: 'oferta',
    category: 'Equipament Oficina',
    price: 0,
    priceType: 'gratuït',
    location: 'Tarragona',
    images: [
      'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    ],
    author: 'Anna Soler',
    authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Serveis Generals',
    contactPhone: '977 98 76 54',
    contactEmail: 'anna.soler@gencat.cat',
    status: 'reservat',
    createdAt: 'fa 3 dies',
    expiresAt: 'd\'aquí 7 dies',
    views: 456,
    favorites: 23,
    isFavorite: false
  },
  {
    id: 4,
    title: 'Vehicle Nissan Leaf elèctric',
    description: 'Cotxe elèctric del parc mòbil departamental. Any 2019, 45.000 km, perfecte estat. ITV passada. Inclou cable de càrrega.',
    type: 'oferta',
    category: 'Vehicles',
    price: 12500,
    priceType: 'fix',
    location: 'Lleida',
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop'
    ],
    author: 'Pere Garcia',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Parc Mòbil',
    contactPhone: '973 45 67 89',
    contactEmail: 'pere.garcia@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 1 setmana',
    expiresAt: 'd\'aquí 21 dies',
    views: 678,
    favorites: 34,
    isFavorite: true
  },
  {
    id: 5,
    title: 'Espai d\'oficina disponible',
    description: 'Despatx de 25m² al centre de Barcelona. Lluminós, amb aire condicionat i calefacció. Ideal per a 3-4 persones.',
    type: 'oferta',
    category: 'Immobiliària',
    price: 450,
    priceType: 'fix',
    location: 'Barcelona',
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop'
    ],
    author: 'Carla Roca',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Patrimoni',
    contactPhone: '93 567 89 01',
    contactEmail: 'carla.roca@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 4 dies',
    expiresAt: 'd\'aquí 30 dies',
    views: 234,
    favorites: 18,
    isFavorite: false
  },
  {
    id: 6,
    title: 'Material d\'oficina variat',
    description: 'Lot de material d\'oficina nou: 500 carpetes, 1000 bolígrafs, 50 caixes d\'arxiu, 200 llibretes. Per excés d\'estoc.',
    type: 'oferta',
    category: 'Material Fungible',
    price: 150,
    priceType: 'negociable',
    location: 'Manresa',
    images: [
      'https://images.unsplash.com/photo-1568485248685-019a98426ea3?w=400&h=300&fit=crop'
    ],
    author: 'Laura Vidal',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Compres',
    contactPhone: '93 876 54 32',
    contactEmail: 'laura.vidal@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 5 dies',
    expiresAt: 'd\'aquí 10 dies',
    views: 123,
    favorites: 7,
    isFavorite: false
  },
  {
    id: 7,
    title: 'Busco assessorament jurídic especialitzat',
    description: 'Necessitem consultoria jurídica experta en protecció de dades i RGPD per revisar els nostres protocols.',
    type: 'demanda',
    category: 'Serveis Professionals',
    price: 3000,
    priceType: 'negociable',
    location: 'Reus',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop'
    ],
    author: 'Joan Ferrer',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Jurídic',
    contactPhone: '977 11 22 33',
    contactEmail: 'joan.ferrer@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 6 dies',
    expiresAt: 'd\'aquí 20 dies',
    views: 156,
    favorites: 9,
    isFavorite: false
  },
  {
    id: 8,
    title: 'Projectors i pantalles per a presentacions',
    description: '3 projectors Epson EB-2250U i 3 pantalles de projecció de 100". Excel·lent qualitat d\'imatge.',
    type: 'oferta',
    category: 'Tecnologia',
    price: 800,
    priceType: 'fix',
    location: 'Vic',
    images: [
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop'
    ],
    author: 'Marc Solà',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    authorDepartment: 'Audiovisuals',
    contactPhone: '93 885 50 00',
    contactEmail: 'marc.sola@gencat.cat',
    status: 'actiu',
    createdAt: 'fa 1 setmana',
    expiresAt: 'd\'aquí 14 dies',
    views: 267,
    favorites: 15,
    isFavorite: true
  }
];