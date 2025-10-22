export interface Notification {
  id: string;
  tipus: 'missatge' | 'event' | 'grup' | 'assessorament' | 'formacio' | 'empresa' | 'anunci' | 'sistema';
  titol: string;
  missatge: string;
  llegit: boolean;
  data_creacio: string;
  accio_url?: string;
  accio_text?: string;
  emissor?: {
    nom: string;
    avatar?: string;
    tipus: 'usuari' | 'grup' | 'empresa' | 'admin' | 'sistema';
  };
  metadades?: {
    grup_id?: string;
    event_id?: string;
    empresa_id?: string;
    conversa_id?: string;
    post_id?: string;
  };
  prioritat: 'baixa' | 'normal' | 'alta' | 'urgent';
}

export interface NotificationStats {
  total: number;
  no_llegits: number;
  per_tipus: {
    missatge: number;
    event: number;
    grup: number;
    assessorament: number;
    formacio: number;
    empresa: number;
    anunci: number;
    sistema: number;
  };
}