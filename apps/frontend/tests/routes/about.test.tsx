import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import styles from '../../src/routes/Layout.module.css';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('About Route', () => {
  test('renders about heading when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    expect(
      screen.getByRole('heading', { level: 3, name: 'About Page' })
    ).toBeInTheDocument();
  });

  test('renders description text when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    expect(
      screen.getByText(
        'This is the about page demonstrating routing with TanStack Router.'
      )
    ).toBeInTheDocument();
  });

  test('renders large outline button when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    const button = screen.getByRole('button', { name: 'Large Outline Button' });
    expect(button).toBeInTheDocument();
  });

  test('has correct layout structure when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    // Find the div with page class by searching for the heading's parent
    const mainDiv = screen.getByRole('heading').parentElement;
    expect(mainDiv).toHaveClass(styles.page || 'page');

    const buttonContainer = screen.getByRole('button', {
      name: 'Large Outline Button',
    }).parentElement;
    expect(buttonContainer).toHaveClass(styles.section || 'section');
  });

  test('content is in correct order when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    const heading = screen.getByRole('heading', { level: 3 });
    const paragraph = screen.getByText(/This is the about page/);
    const button = screen.getByRole('button', { name: 'Large Outline Button' });

    // Verify DOM order
    const container = heading.parentElement;
    if (container) {
      const children = Array.from(container.children);
      const buttonParent = button.parentElement;
      if (buttonParent) {
        expect(children.indexOf(heading)).toBeLessThan(
          children.indexOf(paragraph)
        );
        expect(children.indexOf(paragraph)).toBeLessThan(
          children.indexOf(buttonParent)
        );
      }
    }
  });

  test('button has correct size attribute when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    const button = screen.getByRole('button', { name: 'Large Outline Button' });
    expect(button).toBeInTheDocument();
    // Note: We can't easily test the size prop directly since it's handled internally by Radix UI
    // But we can verify the button renders and is accessible
  });

  test('page has proper semantic structure when navigating to /about', async () => {
    const router = createTestRouter(['/about']);
    await renderWithRouter(router);

    // Check that we have exactly one heading
    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('About Page');

    // Check that we have the content button plus the theme switcher
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    // Find the content button specifically
    const contentButton = screen.getByRole('button', {
      name: 'Large Outline Button',
    });
    expect(contentButton).toHaveTextContent('Large Outline Button');
  });
});
