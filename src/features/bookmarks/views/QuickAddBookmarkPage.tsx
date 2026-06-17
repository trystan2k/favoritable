'use client';

import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isUnauthorizedError } from '@/features/auth/lib/is-unauthorized-error';
import {
  isBookmarkMessageKey,
  quickAddBookmarkFormError
} from '@/features/bookmarks/lib/bookmark-messages';
import {
  createBookmark,
  type CreateBookmarkResult
} from '@/features/bookmarks/server/create-bookmark';

import styles from './QuickAddBookmarkPage.module.css';

type QuickAddBookmarkPageProps = {
  onSuccess?: () => Promise<void>;
  submitBookmark?: (input: FormValues) => Promise<CreateBookmarkResult>;
};

type FormValues = {
  description: string;
  title: string;
  url: string;
};

type FieldName = 'description' | 'title' | 'url';
type FieldErrors = Partial<Record<FieldName, string[]>>;

const initialValues: FormValues = {
  description: '',
  title: '',
  url: ''
};

export function QuickAddBookmarkPage({ onSuccess, submitBookmark }: QuickAddBookmarkPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const activeRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const saveRequestRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const urlLabelId = useId();
  const titleLabelId = useId();
  const descriptionLabelId = useId();
  const urlInputId = useId();
  const titleInputId = useId();
  const descriptionInputId = useId();
  const urlErrorId = useId();
  const titleErrorId = useId();
  const titleHintId = useId();
  const descriptionErrorId = useId();
  const formErrorId = useId();
  const submitAction = useCallback(
    (input: FormValues) => {
      if (submitBookmark) {
        return submitBookmark(input);
      }

      return createBookmark({ data: input });
    },
    [submitBookmark]
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      saveRequestRef.current = false;
    };
  }, []);

  const handleSuccess = useCallback(async () => {
    if (onSuccess) {
      await onSuccess();
      return;
    }

    await router.invalidate();
    await navigate({ to: '/' });
  }, [navigate, onSuccess, router]);
  const handleUnauthorized = useCallback(async () => {
    await router.invalidate();
    await navigate({ to: '/login' });
  }, [navigate, router]);
  const handleCancelClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isSaving) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [isSaving]
  );
  const handleChange = useCallback(
    (field: FieldName) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;

      setFieldErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };

        delete nextErrors[field];

        return nextErrors;
      });
      setFormError(null);
      setValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue
      }));
    },
    []
  );
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (saveRequestRef.current) {
        return;
      }

      const requestId = activeRequestIdRef.current + 1;

      activeRequestIdRef.current = requestId;
      saveRequestRef.current = true;
      setIsSaving(true);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await submitAction(values);

        if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
          return;
        }

        if (!result.success) {
          setFieldErrors(result.fieldErrors);
          setFormError(result.formError ?? null);
          return;
        }

        saveRequestRef.current = false;
        setIsSaving(false);

        await handleSuccess();
      } catch (error) {
        if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
          return;
        }

        if (isUnauthorizedError(error)) {
          await handleUnauthorized();
          return;
        }

        setFormError(quickAddBookmarkFormError);
      } finally {
        saveRequestRef.current = false;

        if (isMountedRef.current && activeRequestIdRef.current === requestId) {
          setIsSaving(false);
        }
      }
    },
    [handleSuccess, handleUnauthorized, submitAction, values]
  );

  return (
    <section aria-labelledby="quick-add-bookmark-heading" className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{t('bookmarks.quickAdd.eyebrow')}</p>
          <h2 className={styles.heading} id="quick-add-bookmark-heading">
            {t('bookmarks.quickAdd.heading')}
          </h2>
          <p className={styles.body}>{t('bookmarks.quickAdd.body')}</p>
        </div>

        <Link
          aria-disabled={isSaving ? 'true' : undefined}
          className={styles.secondaryAction}
          onClick={handleCancelClick}
          tabIndex={isSaving ? -1 : undefined}
          to="/"
        >
          {t('bookmarks.quickAdd.actions.cancel')}
        </Link>
      </div>

      <form
        aria-describedby={formError ? formErrorId : undefined}
        aria-busy={isSaving ? 'true' : 'false'}
        className={styles.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <fieldset className={styles.fieldset} disabled={isSaving}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={urlInputId} id={urlLabelId}>
              {t('bookmarks.quickAdd.fields.url.label')}
            </label>
            <input
              aria-label={t('bookmarks.quickAdd.fields.url.label')}
              aria-labelledby={urlLabelId}
              aria-describedby={fieldErrors.url ? urlErrorId : undefined}
              aria-invalid={fieldErrors.url ? 'true' : 'false'}
              autoComplete="url"
              className={styles.input}
              id={urlInputId}
              name="url"
              onChange={handleChange('url')}
              placeholder={t('bookmarks.quickAdd.fields.url.placeholder')}
              required
              type="url"
              value={values.url}
            />
            {fieldErrors.url ? (
              <p className={styles.fieldError} id={urlErrorId} role="alert">
                {localizeMessage(fieldErrors.url[0], t)}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={titleInputId} id={titleLabelId}>
              {t('bookmarks.quickAdd.fields.title.label')}
            </label>
            <input
              aria-label={t('bookmarks.quickAdd.fields.title.label')}
              aria-labelledby={titleLabelId}
              aria-describedby={fieldErrors.title ? `${titleHintId} ${titleErrorId}` : titleHintId}
              aria-invalid={fieldErrors.title ? 'true' : 'false'}
              className={styles.input}
              id={titleInputId}
              name="title"
              onChange={handleChange('title')}
              placeholder={t('bookmarks.quickAdd.fields.title.placeholder')}
              type="text"
              value={values.title}
            />
            <p className={styles.hint} id={titleHintId}>
              {t('bookmarks.quickAdd.fields.title.hint')}
            </p>
            {fieldErrors.title ? (
              <p className={styles.fieldError} id={titleErrorId} role="alert">
                {localizeMessage(fieldErrors.title[0], t)}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={descriptionInputId} id={descriptionLabelId}>
              {t('bookmarks.quickAdd.fields.description.label')}
            </label>
            <textarea
              aria-label={t('bookmarks.quickAdd.fields.description.label')}
              aria-labelledby={descriptionLabelId}
              aria-describedby={fieldErrors.description ? descriptionErrorId : undefined}
              aria-invalid={fieldErrors.description ? 'true' : 'false'}
              className={styles.textarea}
              id={descriptionInputId}
              name="description"
              onChange={handleChange('description')}
              placeholder={t('bookmarks.quickAdd.fields.description.placeholder')}
              rows={5}
              value={values.description}
            />
            {fieldErrors.description ? (
              <p className={styles.fieldError} id={descriptionErrorId} role="alert">
                {localizeMessage(fieldErrors.description[0], t)}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className={styles.formError} id={formErrorId} role="alert">
              {localizeMessage(formError, t)}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.primaryAction} disabled={isSaving} type="submit">
              {isSaving
                ? t('bookmarks.quickAdd.actions.saving')
                : t('bookmarks.quickAdd.actions.save')}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

function localizeMessage(message: string, translate: (key: string) => string) {
  if (isBookmarkMessageKey(message)) {
    return translate(message);
  }

  return message;
}
