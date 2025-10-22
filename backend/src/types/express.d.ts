import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      email: string;
      primaryRole: string;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    primaryRole: string;
  };
}