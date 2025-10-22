// Tipos para el detalle de anuncio - extendiendo la interfaz base
export interface Anunci {
  id: number;
  slug: string;
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
  authorRating: number;
  authorReviews: number;
  authorMemberSince: string;
  authorVerified: boolean;
  authorSalesCompleted: number;
  authorActiveAds: number;
  authorResponseTime: string;
  contactPhone: string;
  contactEmail: string;
  status: 'actiu' | 'reservat' | 'tancat' | 'caducat';
  createdAt: string;
  expiresAt: string;
  views: number;
  favorites: number;
  isFavorite: boolean;
  specifications: Record<string, string>;
  shippingAvailable: boolean;
  handPickup: boolean;
}

// Tipus per als anuncis relacionats
export interface RelatedAd {
  id: number;
  title: string;
  price: number;
  priceType: 'fix' | 'negociable' | 'gratuït';
  image: string;
  location: string;
  type: 'oferta' | 'demanda';
}

// Dades mock de l'anunci principal
export const getMockAnunci = (slug: string): Anunci => ({
  id: 1,
  slug: 'ordinadors-sobretaula-dell-optiplex',
  title: 'Ordinadors de sobretaula Dell OptiPlex',
  description: `Lot de 15 ordinadors Dell OptiPlex 7080, Intel i5, 8GB RAM, 256GB SSD. En perfecte estat, provinent d'equipament d'oficina del sector públic que s'ha renovat. Tots els equips funcionen correctament i estan llestos per usar.

**Característiques:**
• Processador: Intel Core i5-10500
• RAM: 8GB DDR4
• Emmagatzematge: 256GB SSD
• Sistema operatiu: Windows 10 Pro
• Ports: USB 3.0, HDMI, DisplayPort

Ideal per oficines, escoles, teletreball, etc. Venda en lot o unitats individuals (consultar preu). Possibilitat d'enviament a tota Catalunya.

Tots els equips han estat testejats i netejats professionalment. Incloem cables d'alimentació. Garantia de 3 mesos per defectes de funcionament.`,
  type: 'oferta',
  category: 'Tecnologia',
  price: 3500,
  priceType: 'negociable',
  location: 'Barcelona, Catalunya',
  images: [
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800',
    'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=800',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
  ],
  author: 'Josep Martínez',
  authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  authorDepartment: 'Tecnologia i Innovació',
  authorRating: 4.8,
  authorReviews: 23,
  authorMemberSince: 'gener 2024',
  authorVerified: true,
  authorSalesCompleted: 12,
  authorActiveAds: 3,
  authorResponseTime: '2 hores',
  contactPhone: '666 777 888',
  contactEmail: 'josep.martinez@lapublica.cat',
  status: 'actiu',
  createdAt: 'fa 2 hores',
  expiresAt: '2024-11-15',
  views: 245,
  favorites: 12,
  isFavorite: false,
  specifications: {
    'Estat': 'Usat - Bon estat',
    'Marca': 'Dell',
    'Model': 'OptiPlex 7080',
    'Quantitat': '15 unitats',
    'Any': '2020',
    'Color': 'Negre',
    'Garantia': '3 mesos',
    'Processador': 'Intel Core i5-10500',
    'RAM': '8GB DDR4',
    'Emmagatzematge': '256GB SSD'
  },
  shippingAvailable: true,
  handPickup: true
});

// Anuncis relacionats
export const relatedAds: RelatedAd[] = [
  {
    id: 2,
    title: 'Portàtils Lenovo ThinkPad',
    price: 450,
    priceType: 'fix',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    location: 'Barcelona',
    type: 'oferta'
  },
  {
    id: 3,
    title: 'Monitors Dell 24" Full HD',
    price: 120,
    priceType: 'negociable',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    location: 'Girona',
    type: 'oferta'
  },
  {
    id: 4,
    title: 'Impressora multifunció HP',
    price: 80,
    priceType: 'fix',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400',
    location: 'Tarragona',
    type: 'oferta'
  },
  {
    id: 5,
    title: 'Teclats i ratolins sense fils',
    price: 25,
    priceType: 'fix',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    location: 'Lleida',
    type: 'oferta'
  }
];

// Opcions per al select de raons de report
export const reportReasons = [
  'És spam o publicitat enganyosa',
  'Contingut ofensiu o inapropiat',
  'Article prohibit',
  'Estafa o frau',
  'Informació incorrecta',
  'Altres'
];

// Missatge per defecte del formulari de contacte
export const defaultContactMessage = 'Hola! Estic interessat en aquest anunci. Pots donar-me més informació?';