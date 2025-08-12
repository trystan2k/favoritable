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
  });

  test('buttons are rendered in correct order when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveTextContent('Solid Button');
    expect(buttons[1]).toHaveTextContent('Soft Button');
    expect(buttons[2]).toHaveTextContent('Outline Button');
    expect(buttons[3]).toHaveTextContent('Ghost Button');
  });

  test('has correct layout structure when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    // Find the div with padding style by testing-library data attributes or by searching for the text content
    const mainDiv = screen.getByRole('heading').parentElement;
    expect(mainDiv).toHaveAttribute(
      'style',
      expect.stringContaining('padding: 1rem')
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
      expect.stringContaining('gap: 0.5rem')
    );
    expect(buttonContainer).toHaveAttribute(
      'style',
      expect.stringContaining('margin-top: 1rem')
    );
  });

  test('content is in correct order when navigating to /', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const heading = screen.getByRole('heading', { level: 3 });
    const firstButton = screen.getByRole('button', { name: 'Solid Button' });

    // Verify DOM order
    const container = heading.parentElement;
    if (container) {
      const children = Array.from(container.children);
      const buttonParent = firstButton.parentElement;
      if (buttonParent) {
        expect(children.indexOf(heading)).toBeLessThan(
          children.indexOf(buttonParent)
        );
      }
    }
  });
});
