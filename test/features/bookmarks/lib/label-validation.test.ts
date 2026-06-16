import { describe, expect, test } from 'vitest';

import {
  labelValidationLimits,
  validateCreateLabelInput,
  validateUpdateLabelInput
} from '@/features/bookmarks/lib/label-validation';

describe('label validation', () => {
  test('normalizes valid label input', () => {
    const result = validateCreateLabelInput({
      color: '  #7c3aed  ',
      name: '  Reading Queue  '
    });

    expect(result).toEqual({
      data: {
        color: '#7c3aed',
        name: 'Reading Queue'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('rejects whitespace-only label names', () => {
    const result = validateCreateLabelInput({
      name: '   '
    });

    expect(result).toEqual({
      fieldErrors: {
        name: ['Name is required.']
      },
      success: false
    });
  });

  test('rejects label names over the configured limit', () => {
    const result = validateCreateLabelInput({
      name: 'x'.repeat(labelValidationLimits.name + 1)
    });

    expect(result).toEqual({
      fieldErrors: {
        name: [`Name must be ${labelValidationLimits.name} characters or fewer.`]
      },
      success: false
    });
  });

  test('requires a label field for updates', () => {
    const result = validateUpdateLabelInput({});

    expect(result).toEqual({
      fieldErrors: {},
      formError: 'At least one label field must be provided.',
      success: false
    });
  });

  test('normalizes update label names before uniqueness checks', () => {
    const result = validateUpdateLabelInput({
      color: '   ',
      name: '  Reading  '
    });

    expect(result).toEqual({
      data: {
        color: undefined,
        name: 'Reading'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('allows color-only label updates', () => {
    const result = validateUpdateLabelInput({
      color: '  slate-500  '
    });

    expect(result).toEqual({
      data: {
        color: 'slate-500'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('rejects label colors over the configured limit', () => {
    const result = validateCreateLabelInput({
      color: 'x'.repeat(labelValidationLimits.color + 1),
      name: 'Reading'
    });

    expect(result).toEqual({
      fieldErrors: {
        color: [`Color must be ${labelValidationLimits.color} characters or fewer.`]
      },
      success: false
    });
  });

  test('allows creating a label without a color since color is optional', () => {
    const result = validateCreateLabelInput({
      name: 'Reading'
    });

    expect(result).toEqual({
      data: {
        color: undefined,
        name: 'Reading'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('rejects non-string color values on create', () => {
    const result = validateCreateLabelInput({
      color: 12345,
      name: 'Reading'
    });

    expect(result).toEqual({
      fieldErrors: {
        color: ['Color must be a string.']
      },
      success: false
    });
  });

  test('rejects non-string color values on update', () => {
    const result = validateUpdateLabelInput({
      color: 12345
    });

    expect(result).toEqual({
      fieldErrors: {
        color: ['Color must be a string.']
      },
      success: false
    });
  });
});
