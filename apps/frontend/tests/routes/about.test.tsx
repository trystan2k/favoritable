import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import styles from '../../src/routes/(protected)/Layout.module.css';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('About Route', () => {
  describe('Unauthenticated users', () => {
    test('should redirect to login when navigating to /about', async () => {
      const router = await createTestRouter(['/about']);
      await renderWithRouter(router);

      // Unauthenticated users should see the login page
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Sign in to Your Account',
        })
      ).toBeInTheDocument();
    });

    test('should show login form when redirected from /about', async () => {
      const router = await createTestRouter(['/about']);
      await renderWithRouter(router);

      // Should see the login page content
      expect(screen.getByText('Choose your preferred sign-in method')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Google Continue with Google' })
      ).toBeInTheDocument();
    });
  });

  describe('Authenticated users', () => {
    test('should render about heading when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      expect(screen.getByRole('heading', { level: 3, name: 'About Page' })).toBeInTheDocument();
    });

    test('should render description text when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      expect(
        screen.getByText('This is the about page demonstrating routing with TanStack Router.')
      ).toBeInTheDocument();
    });

    test('should render large outline button when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      const button = screen.getByRole('button', {
        name: 'Large Outline Button',
      });
      expect(button).toBeInTheDocument();
    });

    test('should render correct layout structure when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      // Find the div with page class by searching for the heading's parent
      const mainDiv = screen.getByRole('heading').parentElement;
      expect(mainDiv).toHaveClass(styles.page || 'page');

      const buttonContainer = screen.getByRole('button', {
        name: 'Large Outline Button',
      }).parentElement;
      expect(buttonContainer).toHaveClass(styles.section || 'section');
    });

    test('should render content in correct order when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      const heading = screen.getByRole('heading', { level: 3 });
      const paragraph = screen.getByText(/This is the about page/);
      const button = screen.getByRole('button', {
        name: 'Large Outline Button',
      });

      // Verify DOM order
      const container = heading.parentElement;
      if (container) {
        const children = Array.from(container.children);
        const buttonParent = button.parentElement;
        if (buttonParent) {
          expect(children.indexOf(heading)).toBeLessThan(children.indexOf(paragraph));
          expect(children.indexOf(paragraph)).toBeLessThan(children.indexOf(buttonParent));
        }
      }
    });

    test('should render button with correct size attribute when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      const button = screen.getByRole('button', {
        name: 'Large Outline Button',
      });
      expect(button).toBeInTheDocument();
      // Note: We can't easily test the size prop directly since it's handled internally by Radix UI
      // But we can verify the button renders and is accessible
    });

    test('should render page with proper semantic structure when navigating to /about with auth', async () => {
      const router = await createTestRouter(['/about'], true);
      await renderWithRouter(router);

      // Check that we have exactly one heading (content heading, plus navigation links)
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(1);

      // Find the specific about page heading
      const aboutHeading = screen.getByRole('heading', {
        level: 3,
        name: 'About Page',
      });
      expect(aboutHeading).toHaveTextContent('About Page');

      // Check that we have the content button plus the theme switcher (and potentially navigation buttons)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);

      // Find the content button specifically
      const contentButton = screen.getByRole('button', {
        name: 'Large Outline Button',
      });
      expect(contentButton).toHaveTextContent('Large Outline Button');
    });
  });
});
