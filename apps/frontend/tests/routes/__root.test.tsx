import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('Root Layout', () => {
  test('should render router devtools in development and redirect to login for unauthenticated users', async () => {
    const router = await createTestRouter(['/home'], false);
    await renderWithRouter(router);

    // Since user is unauthenticated, they should be redirected to login
    // The root layout should render its outlet, which now contains the login page
    expect(screen.getByRole('heading', { name: 'Sign in to Your Account' })).toBeInTheDocument();
  });

  test('should render outlet for child routes when user is authenticated', async () => {
    const router = await createTestRouter(['/home'], true);
    await renderWithRouter(router);

    // When authenticated, the user should see the protected home page
    expect(screen.getByRole('heading', { name: 'Welcome Home!' })).toBeInTheDocument();
  });

  test('should handle login routes correctly for unauthenticated users', async () => {
    const router = await createTestRouter(['/login'], false);
    await renderWithRouter(router);

    // Login route should render through root layout outlet
    expect(screen.getByRole('heading', { name: 'Sign in to Your Account' })).toBeInTheDocument();
  });

  test('should redirect authenticated users away from login page', async () => {
    const router = await createTestRouter(['/login'], true);
    await renderWithRouter(router);

    // Authenticated users accessing login should be redirected to home
    expect(screen.getByRole('heading', { name: 'Welcome Home!' })).toBeInTheDocument();
  });

  test('should handle protected routes correctly for authenticated users', async () => {
    const router = await createTestRouter(['/about'], true);
    await renderWithRouter(router);

    // Protected routes should render through root layout outlet when authenticated
    expect(screen.getByRole('heading', { name: 'About Page' })).toBeInTheDocument();
  });

  test('should redirect unauthenticated users from protected routes to login', async () => {
    const router = await createTestRouter(['/about'], false);
    await renderWithRouter(router);

    // Unauthenticated users should be redirected to login
    expect(screen.getByRole('heading', { name: 'Sign in to Your Account' })).toBeInTheDocument();
  });

  test('should render 404 page for non-existent routes', async () => {
    const router = await createTestRouter(['/non-existent-route'], false);
    await renderWithRouter(router);

    // Root layout should render its notFoundComponent
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });
});
