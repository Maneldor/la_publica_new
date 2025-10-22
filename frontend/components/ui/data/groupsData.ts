export interface Group {
  id: number;
  name: string;
  members: number;
  slogan: string;
  image: string;
}

export const publicGroups: Group[] = [
  { id: 1, name: 'Desenvolupadors Frontend', members: 24, slogan: 'Codificant el futur, un component cada cop', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop' },
  { id: 2, name: 'Disseny UX/UI', members: 18, slogan: 'Creant experiències que importen', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop' },
  { id: 3, name: 'Marketing Digital', members: 32, slogan: 'Connectant marques amb persones', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
  { id: 4, name: 'Emprenedors', members: 15, slogan: 'Transformant idees en realitat', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop' },
];

export const privateGroups: Group[] = [
  { id: 5, name: 'Projecte Alpha', members: 8, slogan: 'Innovació confidencial en desenvolupament', image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop' },
  { id: 6, name: 'Consultors Senior', members: 12, slogan: 'Experiència al servei de l\'excel·lència', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop' },
  { id: 7, name: 'Formació Interna', members: 6, slogan: 'Creixement professional continu', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop' },
];

export const secretGroups: Group[] = [
  { id: 8, name: 'Consell Directiu', members: 5, slogan: 'Liderant el futur de l\'organització', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' },
  { id: 9, name: 'Innovació R&D', members: 4, slogan: 'Explorant fronteres tecnològiques', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop' },
];