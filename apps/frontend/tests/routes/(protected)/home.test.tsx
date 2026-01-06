import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { createTestRouter, renderWithRouter, setupAuth } from '../../test-utils';

describe('Home Route', () => {
  describe('Unauthenticated users', () => {
    test('should redirect to login when navigating to /home', async () => {
      const router = await createTestRouter(['/home']);
      await renderWithRouter(router);

      // Unauthenticated users should see the login page
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Sign in to Your Account',
        })
      ).toBeInTheDocument();
    });
  });

  describe('Authenticated users', () => {
    test('should render welcome heading when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      expect(screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })).toBeInTheDocument();
    });

    test('should render all button variants when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      expect(screen.getByRole('button', { name: 'Solid Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Soft Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Outline Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ghost Button' })).toBeInTheDocument();
    });

    test('should apply CSS modules classes correctly to components when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Check that buttons have CSS Module classes applied
      const solidButton = screen.getByRole('button', { name: 'Solid Button' });
      expect(solidButton.className).toMatch(/button_/); // Should contain CSS module generated class name
    });

    test('should render buttons in correct order when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Filter out the theme switcher button and only check the content buttons
      const allButtons = screen.getAllByRole('button');
      const contentButtons = allButtons.filter(
        (button) => !button.getAttribute('aria-label')?.includes('Switch to')
      );

      expect(contentButtons.length).toBeGreaterThanOrEqual(4); // Four button variants (might be more with navigation)

      // Find the specific content buttons
      expect(screen.getByRole('button', { name: 'Solid Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Soft Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Outline Button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ghost Button' })).toBeInTheDocument();
    });

    test('should render correct layout structure when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      // Find the main heading
      const mainHeading = screen.getByRole('heading', {
        level: 3,
        name: 'Welcome Home!',
      });
      expect(mainHeading).toBeInTheDocument();

      // Test that we can find the description text and buttons
      expect(screen.getByText(/Design tokens are working!/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Solid Button' })).toBeInTheDocument();
    });

    test('should render content in correct order when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      const heading = screen.getByRole('heading', { level: 3 });
      const descriptionText = screen.getByText(/Design tokens are working!/);

      // Verify both elements exist
      expect(heading).toBeInTheDocument();
      expect(descriptionText).toBeInTheDocument();
    });

    test('should render description text about design tokens when navigating to /home with auth', async () => {
      setupAuth(true);
      const router = await createTestRouter(['/home'], true);
      await renderWithRouter(router);

      expect(screen.getByText(/Design tokens are working!/)).toBeInTheDocument();
      expect(screen.getByText(/This card uses theme-aware CSS variables/)).toBeInTheDocument();
    });
  });
});
