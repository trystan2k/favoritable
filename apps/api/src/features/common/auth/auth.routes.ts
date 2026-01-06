import { Hono } from 'hono';
import { auth } from '../../../auth.js';
import { Service } from '../../../core/dependency-injection/di.decorators.js';
import { NotAuthorizedError } from '../../../errors/errors.js';
import { authMiddleware, type HonoEnv } from '../../../middleware/auth.middleware.js';

@Service({ name: 'AuthRoutes' })
export class AuthRoutes {
  private authRoutes: Hono<HonoEnv>;

  constructor() {
    this.authRoutes = new Hono();
    this.setupRoutes();
  }

  get routes() {
    return this.authRoutes;
  }

  private setupRoutes() {
    // Test routes
    this.authRoutes.get('/test/no-auth', (c) => {
      return c.json({ message: 'This endpoint works without auth' });
    });

    this.authRoutes.get('/test/with-auth', authMiddleware(), (c) => {
      const user = c.get('user');

      return c.json({
        message: 'This endpoint requires auth',
        user: user ? user.email : null,
      });
    });

    // Session route
    this.authRoutes.get('/auth/session', (c) => {
      const session = c.get('session');
      const user = c.get('user');

      if (!user) throw new NotAuthorizedError('Unauthorized');

      return c.json({
        session,
        user,
      });
    });

    // Better Auth handler routes
    this.authRoutes.on(['POST', 'GET'], '/auth/*', (c) => {
      return auth.handler(c.req.raw);
    });
  }
}
