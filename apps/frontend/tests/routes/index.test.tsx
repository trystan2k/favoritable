import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import styles from '../../src/routes/Layout.module.css';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('Index Route', () => {
  test('should render welcome heading when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Welcome Home!' })
    ).toBeInTheDocument();
  });

  test('should render all button variants when navigating to /', async () => {
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
  });

  test('should apply CSS modules classes correctly to components when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Check that CSS modules classes are applied
    const pageContent = screen.getByRole('heading', {
      name: 'Welcome Home!',
    }).parentElement;

    expect(pageContent).toHaveClass(styles.page || 'page');

    // Check that buttons have CSS Module classes applied
    const solidButton = screen.getByRole('button', { name: 'Solid Button' });
    expect(solidButton.className).toMatch(/button_/); // Should contain CSS module generated class name
  });

  test('should render buttons in correct order when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Filter out the theme switcher button and only check the content buttons
    const allButtons = screen.getAllByRole('button');
    const contentButtons = allButtons.filter(
      (button) => !button.getAttribute('aria-label')?.includes('Switch to')
    );

    expect(contentButtons).toHaveLength(4); // Four button variants
    expect(contentButtons[0]).toHaveTextContent('Solid Button');
    expect(contentButtons[1]).toHaveTextContent('Soft Button');
    expect(contentButtons[2]).toHaveTextContent('Outline Button');
    expect(contentButtons[3]).toHaveTextContent('Ghost Button');
  });

  test('should render correct layout structure when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Find the main div that now uses CSS custom properties - use specific heading
    const mainHeading = screen.getByRole('heading', {
      level: 3,
      name: 'Welcome Home!',
    });
    const mainDiv = mainHeading.parentElement;
    expect(mainDiv).toHaveClass(styles.page || 'page');

    // Test the card container that wraps the description and buttons
    const descriptionText = screen.getByText(/Design tokens are working!/);
    const cardContainer = descriptionText.parentElement;
    expect(cardContainer).toHaveClass(styles.card || 'card');

    const buttonContainer = screen.getByRole('button', {
      name: 'Solid Button',
    }).parentElement;
    expect(buttonContainer).toHaveClass(styles.buttonGroup || 'buttonGroup');
  });

  test('should render content in correct order when navigating to /', async () => {
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
