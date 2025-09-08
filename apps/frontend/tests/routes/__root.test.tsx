import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('Root Layout', () => {
  test('renders navigation bar with Home and About links', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Check that navigation links are present
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  test('Home link has correct href attribute', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('About link has correct href attribute', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  test('renders navigation bar with correct styling', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Find the navigation container by looking for the grandparent of the links
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const navContainer = homeLink.parentElement?.parentElement;

    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('border-bottom: 1px solid')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('display: flex')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('padding: 1rem')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('gap: 1rem')
    );
  });

  test('renders child route content in outlet when navigating to home', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Check that the home page content is rendered
    expect(
      screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).toBeInTheDocument();
  });

  test('renders child route content in outlet when navigating to about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    // Check that the about page content is rendered
    expect(
      screen.getByRole('heading', { level: 3, name: 'About Page' })
    ).toBeInTheDocument();
  });

  test('navigation works correctly when clicking Home link from About page', async () => {
    const user = userEvent.setup();
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    // Verify we're on about page
    expect(
      screen.getByRole('heading', { level: 3, name: 'About Page' })
    ).toBeInTheDocument();

    // Click Home link
    const homeLink = screen.getByRole('link', { name: 'Home' });
    await user.click(homeLink);

    // Verify we're now on home page
    expect(
      screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'About Page' })
    ).not.toBeInTheDocument();
  });

  test('navigation works correctly when clicking About link from Home page', async () => {
    const user = userEvent.setup();
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Verify we're on home page
    expect(
      screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).toBeInTheDocument();

    // Click About link
    const aboutLink = screen.getByRole('link', { name: 'About' });
    await user.click(aboutLink);

    // Verify we're now on about page
    expect(
      screen.getByRole('heading', { level: 3, name: 'About Page' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).not.toBeInTheDocument();
  });

  test('navigation links are always present regardless of current route', async () => {
    const router = createTestRouter(['/']);
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

  test('navigation links are in correct order', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const navLinks = within(screen.getByRole('navigation')).getAllByRole(
      'link'
    );

    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toHaveTextContent('Home');
    expect(navLinks[1]).toHaveTextContent('About');
  });

  test('layout structure is maintained across different routes', async () => {
    const user = userEvent.setup();
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Navigate to about page
    const aboutLink = screen.getByRole('link', { name: 'About' });
    await user.click(aboutLink);

    // Navigation container should still exist with same structure
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const navContainer = homeLink.parentElement?.parentElement;

    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('border-bottom: 1px solid')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('display: flex')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('padding: 1rem')
    );
    expect(navContainer).toHaveAttribute(
      'style',
      expect.stringContaining('gap: 1rem')
    );
  });

  test('router current location updates correctly during navigation', async () => {
    const user = userEvent.setup();
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Initial location should be home
    expect(router.state.location.pathname).toBe('/');

    // Navigate to about
    const aboutLink = screen.getByRole('link', { name: 'About' });
    await user.click(aboutLink);

    // Location should now be about
    expect(router.state.location.pathname).toBe('/about');

    // Navigate back to home
    const homeLink = screen.getByRole('link', { name: 'Home' });
    await user.click(homeLink);

    // Location should be back to home
    expect(router.state.location.pathname).toBe('/');
  });
});
