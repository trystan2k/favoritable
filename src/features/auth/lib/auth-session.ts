import type { Locale } from '@/shared/i18n/locale';

export type AuthenticatedServerSession = {
  session: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    token: string;
    updatedAt: Date;
    userId: string;
  };
  user: {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    locale: Locale;
    name: string;
    updatedAt: Date;
  };
};

export type MaybeAuthenticatedServerSession = AuthenticatedServerSession | null;
