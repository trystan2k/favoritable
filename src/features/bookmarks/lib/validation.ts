export type ValidationFieldErrors<TField extends string> = Partial<Record<TField, string[]>>;

export type ValidationResult<TData, TField extends string> =
  | {
      data: TData;
      fieldErrors: ValidationFieldErrors<TField>;
      formError?: undefined;
      success: true;
    }
  | {
      data?: undefined;
      fieldErrors: ValidationFieldErrors<TField>;
      formError?: string;
      success: false;
    };

export const invalidValue = Symbol('invalid-value');

export type InvalidValue = typeof invalidValue;

export function addFieldError<TField extends string>(
  fieldErrors: ValidationFieldErrors<TField>,
  field: TField,
  message: string
) {
  const existingErrors = fieldErrors[field] ?? [];

  fieldErrors[field] = [...existingErrors, message];
}

export function createValidationFailure<TData, TField extends string>(
  fieldErrors: ValidationFieldErrors<TField>,
  formError?: string
): ValidationResult<TData, TField> {
  return {
    fieldErrors,
    formError,
    success: false
  };
}

export function createValidationSuccess<TData, TField extends string>(
  data: TData
): ValidationResult<TData, TField> {
  return {
    data,
    fieldErrors: {},
    success: true
  };
}

export function hasFieldErrors<TField extends string>(fieldErrors: ValidationFieldErrors<TField>) {
  return Object.keys(fieldErrors).length > 0;
}

export function hasOwnProperty(value: object, property: string) {
  return Object.prototype.hasOwnProperty.call(value, property);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeOptionalString(value: unknown): InvalidValue | string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return invalidValue;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : undefined;
}

export function normalizeRequiredString(value: unknown): InvalidValue | string {
  if (typeof value !== 'string') {
    return invalidValue;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : invalidValue;
}

export function normalizeOptionalBoolean(value: unknown): InvalidValue | boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return invalidValue;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'true' || normalizedValue === '1') {
    return true;
  }

  if (normalizedValue === 'false' || normalizedValue === '0') {
    return false;
  }

  return invalidValue;
}

function hasValidCalendarDatePrefix(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);

  if (!match) {
    return true;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  return (
    calendarDate.getUTCFullYear() === year &&
    calendarDate.getUTCMonth() === month - 1 &&
    calendarDate.getUTCDate() === day
  );
}

export function normalizeOptionalDate(value: unknown): Date | InvalidValue | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? invalidValue : value;
  }

  if (typeof value === 'number') {
    const normalizedValue = new Date(value);

    return Number.isNaN(normalizedValue.getTime()) ? invalidValue : normalizedValue;
  }

  if (typeof value !== 'string') {
    return invalidValue;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  if (!hasValidCalendarDatePrefix(normalizedValue)) {
    return invalidValue;
  }

  const parsedValue = new Date(normalizedValue);

  return Number.isNaN(parsedValue.getTime()) ? invalidValue : parsedValue;
}

export function normalizeOptionalUrl(value: unknown): InvalidValue | string | undefined {
  const normalizedValue = normalizeOptionalString(value);

  if (normalizedValue === invalidValue || normalizedValue === undefined) {
    return normalizedValue;
  }

  return isValidHttpUrl(normalizedValue) ? normalizedValue : invalidValue;
}

export function normalizeRequiredUrl(value: unknown): InvalidValue | string {
  const normalizedValue = normalizeRequiredString(value);

  if (normalizedValue === invalidValue) {
    return invalidValue;
  }

  return isValidHttpUrl(normalizedValue) ? normalizedValue : invalidValue;
}

export function unwrapOptionalValidatedValue<T>(value: InvalidValue | T | undefined) {
  if (value === invalidValue) {
    throw new Error('Expected validated optional value.');
  }

  return value;
}

export function unwrapRequiredValidatedValue<T>(value: InvalidValue | T) {
  if (value === invalidValue) {
    throw new Error('Expected validated required value.');
  }

  return value;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
