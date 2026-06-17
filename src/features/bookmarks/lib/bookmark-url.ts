export function canonicalizeBookmarkUrl(value: string) {
  const url = new URL(value);

  return url.href;
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
