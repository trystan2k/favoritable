import { bookmarkValidationLimits } from './bookmark-validation';

type DeriveBookmarkSlugInput = {
  title: string;
  url: string;
};

export function deriveBookmarkTitleFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const normalizedPathname = parsedUrl.pathname.replace(/\/$/, '');
  const fallbackTitle =
    normalizedPathname && normalizedPathname !== '/'
      ? `${parsedUrl.hostname}${normalizedPathname}`
      : parsedUrl.hostname;

  return fallbackTitle.slice(0, bookmarkValidationLimits.title);
}

export function deriveBookmarkSlug({ title, url }: DeriveBookmarkSlugInput) {
  const normalizedTitleSlug = slugify(title);

  if (normalizedTitleSlug) {
    return normalizedTitleSlug;
  }

  const fallbackSlug = slugify(deriveBookmarkTitleFromUrl(url));

  return fallbackSlug || 'bookmark';
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, bookmarkValidationLimits.slug)
    .replace(/-+$/g, '');
}
