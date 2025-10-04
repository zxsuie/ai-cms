import type {IronSessionOptions} from 'iron-session';

export type SessionData = {
  isLoggedIn: boolean;
  username: string;
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
  username: '',
};

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'clinic-flow-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
