import { describe, expect, test } from 'vitest';

import {
  addFieldError,
  createValidationFailure,
  createValidationSuccess,
  hasFieldErrors,
  hasOwnProperty,
  invalidValue,
  isRecord,
  normalizeOptionalBoolean,
  normalizeOptionalDate,
  normalizeOptionalString,
  normalizeOptionalUrl,
  normalizeRequiredString,
  normalizeRequiredUrl,
  unwrapOptionalValidatedValue,
  unwrapRequiredValidatedValue
} from '@/features/bookmarks/lib/validation';

describe('validation utilities', () => {
  describe('addFieldError', () => {
    test('appends error to existing field errors', () => {
      const fieldErrors: Record<string, string[]> = { url: ['First error'] };

      addFieldError(fieldErrors, 'url', 'Second error');

      expect(fieldErrors.url).toEqual(['First error', 'Second error']);
    });

    test('creates new error array for field with no existing errors', () => {
      const fieldErrors: Record<string, string[]> = {};

      addFieldError(fieldErrors, 'title', 'Title error');

      expect(fieldErrors.title).toEqual(['Title error']);
    });
  });

  describe('createValidationFailure', () => {
    test('returns failure with field errors and optional form error', () => {
      const result = createValidationFailure({ url: ['Invalid'] }, 'Form error');

      expect(result).toEqual({
        fieldErrors: { url: ['Invalid'] },
        formError: 'Form error',
        success: false
      });
    });

    test('returns failure without form error when omitted', () => {
      const result = createValidationFailure({ url: ['Invalid'] });

      expect(result.success).toBe(false);
      expect(result.formError).toBeUndefined();
    });
  });

  describe('createValidationSuccess', () => {
    test('returns success with data and empty field errors', () => {
      const result = createValidationSuccess({ url: 'https://example.com' });

      expect(result).toEqual({
        data: { url: 'https://example.com' },
        fieldErrors: {},
        success: true
      });
    });
  });

  describe('hasFieldErrors', () => {
    test('returns false for empty field errors', () => {
      expect(hasFieldErrors({})).toBe(false);
    });

    test('returns true when field errors exist', () => {
      expect(hasFieldErrors({ url: ['error'] })).toBe(true);
    });
  });

  describe('hasOwnProperty', () => {
    test('returns true for own properties', () => {
      expect(hasOwnProperty({ foo: 1 }, 'foo')).toBe(true);
    });

    test('returns false for inherited properties', () => {
      expect(hasOwnProperty({}, 'toString')).toBe(false);
    });

    test('returns false for missing properties', () => {
      expect(hasOwnProperty({ foo: 1 }, 'bar')).toBe(false);
    });
  });

  describe('isRecord', () => {
    test('returns true for plain objects', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ key: 'value' })).toBe(true);
    });

    test('returns false for null', () => {
      expect(isRecord(null)).toBe(false);
    });

    test('returns false for primitives', () => {
      expect(isRecord('string')).toBe(false);
      expect(isRecord(42)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
    });
  });

  describe('normalizeOptionalString', () => {
    test('returns undefined for null and undefined', () => {
      expect(normalizeOptionalString(null)).toBeUndefined();
      expect(normalizeOptionalString(undefined)).toBeUndefined();
    });

    test('returns invalidValue for non-string types', () => {
      expect(normalizeOptionalString(42)).toBe(invalidValue);
      expect(normalizeOptionalString(true)).toBe(invalidValue);
      expect(normalizeOptionalString({})).toBe(invalidValue);
    });

    test('trims and returns string values', () => {
      expect(normalizeOptionalString('  hello  ')).toBe('hello');
    });

    test('returns undefined for blank strings after trimming', () => {
      expect(normalizeOptionalString('   ')).toBeUndefined();
      expect(normalizeOptionalString('')).toBeUndefined();
    });
  });

  describe('normalizeRequiredString', () => {
    test('returns invalidValue for non-string types', () => {
      expect(normalizeRequiredString(null)).toBe(invalidValue);
      expect(normalizeRequiredString(42)).toBe(invalidValue);
      expect(normalizeRequiredString(undefined)).toBe(invalidValue);
    });

    test('returns invalidValue for blank strings', () => {
      expect(normalizeRequiredString('   ')).toBe(invalidValue);
      expect(normalizeRequiredString('')).toBe(invalidValue);
    });

    test('trims and returns non-blank strings', () => {
      expect(normalizeRequiredString('  hello  ')).toBe('hello');
    });
  });

  describe('normalizeOptionalBoolean', () => {
    test('returns undefined for null, undefined, and empty string', () => {
      expect(normalizeOptionalBoolean(null)).toBeUndefined();
      expect(normalizeOptionalBoolean(undefined)).toBeUndefined();
      expect(normalizeOptionalBoolean('')).toBeUndefined();
    });

    test('returns boolean values directly', () => {
      expect(normalizeOptionalBoolean(true)).toBe(true);
      expect(normalizeOptionalBoolean(false)).toBe(false);
    });

    test('parses string boolean values', () => {
      expect(normalizeOptionalBoolean('true')).toBe(true);
      expect(normalizeOptionalBoolean('TRUE')).toBe(true);
      expect(normalizeOptionalBoolean('1')).toBe(true);
      expect(normalizeOptionalBoolean('false')).toBe(false);
      expect(normalizeOptionalBoolean('FALSE')).toBe(false);
      expect(normalizeOptionalBoolean('0')).toBe(false);
    });

    test('returns invalidValue for non-boolean non-string types', () => {
      expect(normalizeOptionalBoolean(42)).toBe(invalidValue);
      expect(normalizeOptionalBoolean({})).toBe(invalidValue);
    });

    test('returns invalidValue for unrecognized string values', () => {
      expect(normalizeOptionalBoolean('yes')).toBe(invalidValue);
      expect(normalizeOptionalBoolean('no')).toBe(invalidValue);
    });
  });

  describe('normalizeOptionalDate', () => {
    test('returns undefined for null, undefined, and empty string', () => {
      expect(normalizeOptionalDate(null)).toBeUndefined();
      expect(normalizeOptionalDate(undefined)).toBeUndefined();
      expect(normalizeOptionalDate('')).toBeUndefined();
    });

    test('returns Date instances directly when valid', () => {
      const date = new Date('2026-06-16T12:00:00.000Z');

      expect(normalizeOptionalDate(date)).toBe(date);
    });

    test('returns invalidValue for invalid Date instances', () => {
      expect(normalizeOptionalDate(new Date('invalid'))).toBe(invalidValue);
    });

    test('converts number timestamps to Date objects', () => {
      const timestamp = 1700000000000;
      const result = normalizeOptionalDate(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getTime()).toBe(timestamp);
    });

    test('returns invalidValue for NaN number values', () => {
      expect(normalizeOptionalDate(Number.NaN)).toBe(invalidValue);
    });

    test('returns invalidValue for non-string non-number non-Date types', () => {
      expect(normalizeOptionalDate(true)).toBe(invalidValue);
      expect(normalizeOptionalDate({})).toBe(invalidValue);
      expect(normalizeOptionalDate([])).toBe(invalidValue);
    });

    test('returns undefined for blank strings after trimming', () => {
      expect(normalizeOptionalDate('   ')).toBeUndefined();
    });

    test('returns invalidValue for impossible calendar dates', () => {
      expect(normalizeOptionalDate('2026-02-31')).toBe(invalidValue);
      expect(normalizeOptionalDate('2026-13-01')).toBe(invalidValue);
    });

    test('parses valid ISO date strings', () => {
      const result = normalizeOptionalDate('2026-06-16T12:00:00.000Z');

      expect(result).toBeInstanceOf(Date);
      expect((result as Date).toISOString()).toBe('2026-06-16T12:00:00.000Z');
    });

    test('returns invalidValue for unparseable date strings', () => {
      expect(normalizeOptionalDate('not-a-date')).toBe(invalidValue);
    });
  });

  describe('normalizeOptionalUrl', () => {
    test('returns undefined for null and undefined', () => {
      expect(normalizeOptionalUrl(null)).toBeUndefined();
      expect(normalizeOptionalUrl(undefined)).toBeUndefined();
    });

    test('returns invalidValue for non-string types', () => {
      expect(normalizeOptionalUrl(42)).toBe(invalidValue);
    });

    test('returns invalidValue for non-HTTP URLs', () => {
      expect(normalizeOptionalUrl('ftp://example.com')).toBe(invalidValue);
      expect(normalizeOptionalUrl('not-a-url')).toBe(invalidValue);
    });

    test('returns canonical URL for valid HTTP/HTTPS URLs', () => {
      expect(normalizeOptionalUrl('  https://example.com  ')).toBe('https://example.com/');
      expect(normalizeOptionalUrl('http://example.com')).toBe('http://example.com/');
    });
  });

  describe('normalizeRequiredUrl', () => {
    test('returns invalidValue for non-string types', () => {
      expect(normalizeRequiredUrl(null)).toBe(invalidValue);
      expect(normalizeRequiredUrl(42)).toBe(invalidValue);
    });

    test('returns invalidValue for blank strings', () => {
      expect(normalizeRequiredUrl('   ')).toBe(invalidValue);
    });

    test('returns invalidValue for non-HTTP URLs', () => {
      expect(normalizeRequiredUrl('ftp://example.com')).toBe(invalidValue);
      expect(normalizeRequiredUrl('not-a-url')).toBe(invalidValue);
    });

    test('returns canonical URL for valid HTTP/HTTPS URLs', () => {
      expect(normalizeRequiredUrl('  https://example.com  ')).toBe('https://example.com/');
    });
  });

  describe('unwrapOptionalValidatedValue', () => {
    test('returns value directly for non-invalid values', () => {
      expect(unwrapOptionalValidatedValue('hello')).toBe('hello');
      expect(unwrapOptionalValidatedValue(undefined)).toBeUndefined();
      expect(unwrapOptionalValidatedValue(42)).toBe(42);
    });

    test('throws when given invalidValue', () => {
      expect(() => unwrapOptionalValidatedValue(invalidValue)).toThrow(
        'Expected validated optional value.'
      );
    });
  });

  describe('unwrapRequiredValidatedValue', () => {
    test('returns value directly for non-invalid values', () => {
      expect(unwrapRequiredValidatedValue('hello')).toBe('hello');
      expect(unwrapRequiredValidatedValue(42)).toBe(42);
    });

    test('throws when given invalidValue', () => {
      expect(() => unwrapRequiredValidatedValue(invalidValue)).toThrow(
        'Expected validated required value.'
      );
    });
  });
});
