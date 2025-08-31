import type { Context, Next } from 'hono';
import type { auth } from '../auth.js';

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
      return c.json({ error: 'Authentication required' }, 401);
    }

    return next();
  };
};
