import type { Context, Next } from 'hono';
import type { auth } from '../auth.js';
import { NotAuthorizedError } from '../errors/errors.js';

export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const authMiddleware = () => {
  return async (c: Context<HonoEnv>, next: Next) => {
    const user = c.get('user');
    const session = c.get('session');

    if (!user || !session) {
      throw new NotAuthorizedError('Unauthorized');
    }

    return next();
  };
};
