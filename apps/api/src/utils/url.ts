/**
 * Validates if a given string is a valid URL.
 * @param url - The string to validate as a URL.
 * @returns boolean - True if the string is a valid URL, false otherwise.
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // Attempt to construct a URL object
    const urlObject = new URL(url);
    // Check if the protocol is http or https
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    // If URL construction fails, the string is not a valid URL
    return false;
  }
};