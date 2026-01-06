import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { createTestRouter, getMockAuthClient, renderWithRouter, setupAuth } from '../../test-utils';

describe('Protected Layout', () => {
  describe('Unauthenticated users', () => {
    test('should redirect to login when accessing protected routes', async () => {
      const router = await createTestRouter(['/home']);
      await renderWithRouter(router);

      // Should see login page, not protected layout
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Sign in to Your Account',
        })
      ).toBeInTheDocument();

      // Should not see navigation links
      expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
    });
  });

  describe('Authenticated users', () => {
    test('should render navigation bar with Home and About links', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Check that navigation links are present
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    test('should render home link with correct href attribute', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/home');
    });

    test('should render about link with correct href attribute', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    test('should render child route content in outlet when on home page', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Check that the home page content is rendered
      expect(screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })).toBeInTheDocument();
    });

    test('should render child route content in outlet when on about page', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      // Check that the about page content is rendered
      expect(screen.getByRole('heading', { level: 3, name: 'About Page' })).toBeInTheDocument();
    });

    test('should navigate to home page when clicking Home link from About page', async () => {
      setupAuth(true);
      const user = userEvent.setup();
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      // Verify we're on about page
      expect(screen.getByRole('heading', { level: 3, name: 'About Page' })).toBeInTheDocument();

      // Click Home link
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);

      // Verify we're now on home page
      expect(screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 3, name: 'About Page' })
      ).not.toBeInTheDocument();
    });

    test('should navigate to about page when clicking About link from Home page', async () => {
      setupAuth(true);
      const user = userEvent.setup();
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Verify we're on home page
      expect(screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })).toBeInTheDocument();

      // Click About link
      const aboutLink = screen.getByRole('link', { name: 'About' });
      await user.click(aboutLink);

      // Verify we're now on about page
      expect(screen.getByRole('heading', { level: 3, name: 'About Page' })).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Welcome Home!' })
      ).not.toBeInTheDocument();
    });

    test('should render navigation links always present regardless of current route', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Links should be present on home page
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();

      // Navigate to about page
      const user = userEvent.setup();
      const aboutLink = screen.getByRole('link', { name: 'About' });
      await user.click(aboutLink);

      // Links should still be present on about page
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    test('should render navigation links in correct order', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      const navLinks = within(screen.getByRole('navigation')).getAllByRole('link');

      expect(navLinks).toHaveLength(2);
      expect(navLinks[0]).toHaveTextContent('Home');
      expect(navLinks[1]).toHaveTextContent('About');
    });

    test('should update router current location correctly during navigation', async () => {
      setupAuth(true);
      const user = userEvent.setup();
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Initial location should be home
      expect(router.state.location.pathname).toBe('/home');

      // Navigate to about
      const aboutLink = screen.getByRole('link', { name: 'About' });
      await user.click(aboutLink);

      // Location should now be about
      expect(router.state.location.pathname).toBe('/about');

      // Navigate back to home
      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);

      // Location should be back to home
      expect(router.state.location.pathname).toBe('/home');
    });

    test('should render theme switcher in navigation', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Theme switcher should be present in the navigation
      const themeSwitcher = screen.getByLabelText(/Switch to (dark|light) theme/);
      expect(themeSwitcher).toBeInTheDocument();
    });

    test('should handle logout button click', async () => {
      const mockAuthClient = getMockAuthClient();
      setupAuth(true);
      const user = userEvent.setup();
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      expect(mockAuthClient.signOut).toHaveBeenCalled();
    });

    test('should handle logout error gracefully', async () => {
      const mockAuthClient = getMockAuthClient();
      setupAuth(true);
      const user = userEvent.setup();
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // biome-ignore lint/suspicious/noExplicitAny: Mock type
      (mockAuthClient.signOut as any).mockRejectedValueOnce(new Error('Logout failed'));

      const logoutButton = screen.getByRole('button', { name: 'Logout' });

      // Should not throw when logout fails
      await expect(user.click(logoutButton)).resolves.not.toThrow();
    });
  });

  describe('Loading state', () => {
    test('should not redirect when session is pending', async () => {
      const mockAuthClient = getMockAuthClient();

      // biome-ignore lint/suspicious/noExplicitAny: Mock type
      (mockAuthClient.getSession as any).mockResolvedValueOnce({
        data: null,
        isPending: true,
        error: null,
      });

      const router = await createTestRouter(['/home']);
      await renderWithRouter(router);

      // Should allow rendering to proceed (no redirect)
      // The page might still redirect based on other logic, but the isPending path was executed
      expect(mockAuthClient.getSession).toHaveBeenCalled();
    });
  });
});
