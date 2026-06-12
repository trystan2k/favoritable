# Favoritable

TanStack Start bookmark manager foundation with Better Auth, Drizzle, Base UI, CSS Modules, and design-token-driven styling.

# Getting Started

Install dependencies and start local dev:

```bash
pnpm install
pnpm dev
```

## Building

Production build gate:

```bash
pnpm build
```

Playwright preview build contract:

```bash
pnpm build:e2e:preview
pnpm preview:e2e
```

## Testing

Run unit/browser coverage tests:

```bash
pnpm test
```

Run smoke E2E:

```bash
pnpm test:e2e:smoke
```

## Styling

Favoritable uses CSS Modules plus generated design tokens from `design-tokens/`. Rebuild tokens with:

```bash
pnpm tokens:build
```

## Build Output

`pnpm build` writes the main app bundles to `dist/client` and `dist/server`.
`pnpm build:e2e:preview` writes the preview-compatible server bundle used by Playwright smoke and extended E2E runs.

## Setting up Better Auth

1. Copy `.env.example` to `.env.local`.
2. Keep `BETTER_AUTH_URL` aligned with the actual app origin. Local dev default is `http://localhost:4000`.
3. Generate and set the `BETTER_AUTH_SECRET` environment variable in your `.env.local`:

   ```bash
   npx -y @better-auth/cli secret
   ```

4. Visit the [Better Auth documentation](https://www.better-auth.com) to unlock the full potential of authentication in your app.

### Local Google OAuth setup

If you enable Google OAuth locally, Google Cloud must use the exact values derived from `BETTER_AUTH_URL`:

- Authorized JavaScript origin: `http://localhost:4000`
- Authorized redirect URI: `http://localhost:4000/api/auth/callback/google`

If you change `BETTER_AUTH_URL` for local work, update both Google Cloud values to the same origin and callback shape immediately. `redirect_uri_mismatch` usually means `BETTER_AUTH_URL` and the Google callback config drifted apart.

### Database bootstrap

Favoritable persists Better Auth data in SQLite through Drizzle. Copy `.env.example`, then bootstrap auth tables before the first auth-enabled run:

```bash
pnpm db:bootstrap:auth
```

`pnpm dev`, `pnpm test`, and the preview E2E path already run this bootstrap step for fresh local databases.

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router';
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' }
    ]
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  )
});
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start';

const getServerTime = createServerFn({
  method: 'GET'
}).handler(async () => {
  return new Date().toISOString();
});

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('');

  useEffect(() => {
    getServerTime().then(setTime);
  }, []);

  return <div>Server time: {time}</div>;
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' })
    }
  }
});
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people');
    return response.json();
  },
  component: PeopleComponent
});

function PeopleComponent() {
  const data = Route.useLoaderData();
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  );
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
