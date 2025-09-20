import { describe, expect, test } from 'vitest';
import { cx } from '../../src/utils/cx';

describe('cx', () => {
  test('should join multiple string arguments with spaces', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  test('should filter out non-string arguments', () => {
    expect(cx('a', 1, null, undefined, 'b', {}, [])).toBe('a b');
  });

  test('should trim the result', () => {
    expect(cx(' a ', 'b ', ' c')).toBe('a b c');
  });

  test('should return an empty string if no string arguments', () => {
    expect(cx(1, null, undefined, {}, [])).toBe('');
  });
});
