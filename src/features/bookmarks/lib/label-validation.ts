import {
  addFieldError,
  createValidationFailure,
  createValidationSuccess,
  hasFieldErrors,
  hasOwnProperty,
  invalidValue,
  isRecord,
  normalizeOptionalString,
  normalizeRequiredString,
  unwrapOptionalValidatedValue,
  unwrapRequiredValidatedValue,
  type ValidationFieldErrors,
  type ValidationResult
} from './validation';

export const labelValidationLimits = {
  color: 32,
  name: 64
} as const;

type LabelValidationField = 'color' | 'name';

export type CreateLabelInput = {
  color?: string;
  name: string;
};

export type UpdateLabelInput = Partial<CreateLabelInput>;
export type LabelValidationResult<TData> = ValidationResult<TData, LabelValidationField>;

export function validateCreateLabelInput(input: unknown): LabelValidationResult<CreateLabelInput> {
  if (!isRecord(input)) {
    return createValidationFailure<CreateLabelInput, LabelValidationField>(
      {},
      'Invalid label input.'
    );
  }

  const fieldErrors: ValidationFieldErrors<LabelValidationField> = {};
  const name = normalizeRequiredString(input.name);
  const color = normalizeLabelColor(fieldErrors, input.color);

  if (name === invalidValue) {
    addFieldError(fieldErrors, 'name', 'Name is required.');
  } else if (name.length > labelValidationLimits.name) {
    addFieldError(
      fieldErrors,
      'name',
      `Name must be ${labelValidationLimits.name} characters or fewer.`
    );
  }

  if (hasFieldErrors(fieldErrors)) {
    return createValidationFailure<CreateLabelInput, LabelValidationField>(fieldErrors);
  }

  return createValidationSuccess<CreateLabelInput, LabelValidationField>({
    color: unwrapOptionalValidatedValue(color),
    name: unwrapRequiredValidatedValue(name)
  });
}

export function validateUpdateLabelInput(input: unknown): LabelValidationResult<UpdateLabelInput> {
  if (!isRecord(input)) {
    return createValidationFailure<UpdateLabelInput, LabelValidationField>(
      {},
      'Invalid label input.'
    );
  }

  const fieldErrors: ValidationFieldErrors<LabelValidationField> = {};
  const data: UpdateLabelInput = {};
  let hasKnownField = false;

  if (hasOwnProperty(input, 'name')) {
    hasKnownField = true;

    const name = normalizeRequiredString(input.name);

    if (name === invalidValue) {
      addFieldError(fieldErrors, 'name', 'Name is required.');
    } else if (name.length > labelValidationLimits.name) {
      addFieldError(
        fieldErrors,
        'name',
        `Name must be ${labelValidationLimits.name} characters or fewer.`
      );
    } else {
      data.name = name;
    }
  }

  if (hasOwnProperty(input, 'color')) {
    hasKnownField = true;

    const color = normalizeLabelColor(fieldErrors, input.color);

    if (color !== invalidValue) {
      data.color = unwrapOptionalValidatedValue(color);
    }
  }

  if (!hasKnownField) {
    return createValidationFailure<UpdateLabelInput, LabelValidationField>(
      {},
      'At least one label field must be provided.'
    );
  }

  if (hasFieldErrors(fieldErrors)) {
    return createValidationFailure<UpdateLabelInput, LabelValidationField>(fieldErrors);
  }

  return createValidationSuccess<UpdateLabelInput, LabelValidationField>(data);
}

function normalizeLabelColor(
  fieldErrors: ValidationFieldErrors<LabelValidationField>,
  value: unknown
) {
  const normalizedValue = normalizeOptionalString(value);

  if (normalizedValue === invalidValue) {
    addFieldError(fieldErrors, 'color', 'Color must be a string.');
    return invalidValue;
  }

  if (normalizedValue && normalizedValue.length > labelValidationLimits.color) {
    addFieldError(
      fieldErrors,
      'color',
      `Color must be ${labelValidationLimits.color} characters or fewer.`
    );
    return invalidValue;
  }

  return normalizedValue;
}
