interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  userLiked: boolean;
}

interface Post {
  id: number;
  user: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  userLiked: boolean;
  showComments: boolean;
}

export const mockPosts: Post[] = [
  {
    id: 1,
    user: 'Maria García',
    avatar: 'MG',
    role: 'Administradora · Ajuntament de Barcelona',
    time: 'Fa 2 hores',
    content: 'Hem implementat les noves funcionalitats del portal de transparència. Ara els ciutadans poden accedir a tota la informació pública de manera més intuïtiva i ràpida. Gran feina de tot l\'equip! 🎉',
    likes: 24,
    comments: [
      {
        id: 1,
        user: 'Joan Martí',
        avatar: 'JM',
        content: 'Excel·lent treball! Això millorarà molt la transparència.',
        time: 'Fa 1 hora',
        likes: 3,
        userLiked: false
      }
    ],
    shares: 5,
    userLiked: false,
    showComments: false
  },
  {
    id: 2,
    user: 'Joan Martí',
    avatar: 'JM',
    role: 'Desenvolupador · Generalitat de Catalunya',
    time: 'Fa 4 hores',
    content: '📚 He compartit la nova guia de bones pràctiques per al desenvolupament d\'aplicacions públiques. Inclou recomanacions sobre accessibilitat, seguretat i rendiment.\n\nPodeu descarregar-la des del repositori oficial.',
    likes: 45,
    comments: [
      {
        id: 1,
        user: 'Anna Soler',
        avatar: 'AS',
        content: 'Molt útil! La compartiré amb el meu equip.',
        time: 'Fa 3 hores',
        likes: 5,
        userLiked: false
      },
      {
        id: 2,
        user: 'Pere Vila',
        avatar: 'PV',
        content: 'Gràcies per compartir! Precisament estava buscant recursos així.',
        time: 'Fa 2 hores',
        likes: 2,
        userLiked: false
      }
    ],
    shares: 12,
    userLiked: true,
    showComments: false
  },
  {
    id: 3,
    user: 'Anna Soler',
    avatar: 'AS',
    role: 'Analista de Dades · Ministeri de Digitalització',
    time: 'Fa 6 hores',
    content: '📊 Nou grup creat: "Anàlisi de Dades Públiques"\n\nSi esteu interessats en big data, visualització de dades i intel·ligència artificial aplicada al sector públic, unieu-vos!\n\nJa som 28 membres i creixent 🚀',
    likes: 67,
    comments: [],
    shares: 8,
    userLiked: false,
    showComments: false
  }
];