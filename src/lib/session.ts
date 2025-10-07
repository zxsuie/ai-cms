
import type {IronSessionOptions} from 'iron-session';
import type { Profile } from './types';

export type SessionData = {
  isLoggedIn: boolean;
  user: {
      id: string;
      email: string;
      role: Profile['role'];
      fullName?: string;
      avatarUrl?: string;
  } | null;
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
  user: null,
};

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'clinic-flow-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
