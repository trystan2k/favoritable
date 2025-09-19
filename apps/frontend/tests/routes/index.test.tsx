import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('Index Route', () => {
  test('renders welcome heading when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).toBeInTheDocument();
  });

  test('renders all button variants when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    expect(
      screen.getByRole('button', { name: 'Solid Button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Soft Button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Outline Button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ghost Button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'CSS Modules Button' })
    ).toBeInTheDocument();
  });

  test('CSS Modules test section is rendered correctly', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Check that the CSS Modules heading is present
    expect(
      screen.getByRole('heading', { level: 4, name: 'CSS Modules Test:' })
    ).toBeInTheDocument();

    // Check that the CSS Modules button is present and styled
    const cssModulesButton = screen.getByRole('button', {
      name: 'CSS Modules Button',
    });
    expect(cssModulesButton).toBeInTheDocument();

    // The button should have CSS Module classes applied - check that className contains hashed class names
    const className = cssModulesButton.className;
    expect(className).toMatch(/button_/); // Should contain CSS module generated class name
  });

  test('buttons are rendered in correct order when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Filter out the theme switcher button and only check the content buttons
    const allButtons = screen.getAllByRole('button');
    const contentButtons = allButtons.filter(
      (button) => !button.getAttribute('aria-label')?.includes('Switch to')
    );

    expect(contentButtons).toHaveLength(5); // Now includes CSS Modules Button
    expect(contentButtons[0]).toHaveTextContent('Solid Button');
    expect(contentButtons[1]).toHaveTextContent('Soft Button');
    expect(contentButtons[2]).toHaveTextContent('Outline Button');
    expect(contentButtons[3]).toHaveTextContent('Ghost Button');
    expect(contentButtons[4]).toHaveTextContent('CSS Modules Button');
  });

  test('has correct layout structure when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Find the main div that now uses CSS custom properties - use specific heading
    const mainHeading = screen.getByRole('heading', {
      level: 3,
      name: 'Welcome Home!',
    });
    const mainDiv = mainHeading.parentElement;
    expect(mainDiv).toHaveAttribute(
      'style',
      expect.stringContaining('padding: var(--spacing-4)')
    );

    // Test the card container that wraps the description and buttons
    const descriptionText = screen.getByText(/Design tokens are working!/);
    const cardContainer = descriptionText.parentElement;
    expect(cardContainer).toHaveAttribute(
      'style',
      expect.stringContaining(
        'background-color: var(--theme-color-background-card)'
      )
    );

    const buttonContainer = screen.getByRole('button', {
      name: 'Solid Button',
    }).parentElement;
    expect(buttonContainer).toHaveAttribute(
      'style',
      expect.stringContaining('display: flex')
    );
    expect(buttonContainer).toHaveAttribute(
      'style',
      expect.stringContaining('gap: var(--spacing-2)')
    );
  });

  test('content is in correct order when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const heading = screen.getByRole('heading', { level: 3 });
    const descriptionText = screen.getByText(/Design tokens are working!/);

    // Verify DOM order - heading should come before the description
    const container = heading.parentElement;
    if (container) {
      const children = Array.from(container.children);
      const cardContainer = descriptionText.parentElement;
      if (cardContainer) {
        expect(children.indexOf(heading)).toBeLessThan(
          children.indexOf(cardContainer)
        );
      }
    }
  });
});
