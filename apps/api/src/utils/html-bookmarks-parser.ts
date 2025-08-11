import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { isValidUrl } from './url.js';

interface HTMLBookmark {
  url: string;
  folderName: string;
}

const parseBookmarksFromFolder = (
  $: cheerio.CheerioAPI,
  element: Element,
  currentFolder: string
): HTMLBookmark[] => {
  const bookmarks: HTMLBookmark[] = [];
  const directDL = $(element).next('dl');
  const bookmarkList = directDL.children().filter('dt').children('a');

  bookmarkList.each((_, link) => {
    const url = $(link).attr('href');
    if (url && isValidUrl(url)) {
      bookmarks.push({
        url,
        folderName: currentFolder,
      });
    }
  });
  return bookmarks;
};

export const parseHtmlbookmarks = (
  html: string,
  folderName?: string
): HTMLBookmark[] => {
  const $ = cheerio.load(html);
  const bookmarks: HTMLBookmark[] = [];

  // If folderName is provided, only parse bookmarks from that folder
  if (folderName) {
    $('h3').each((_, element) => {
      const currentFolder = $(element).text().trim();
      if (currentFolder === folderName) {
        bookmarks.push(...parseBookmarksFromFolder($, element, currentFolder));
      }
    });
  } else {
    // Parse all bookmarks if no folder is specified
    $('h3').each((_, element) => {
      const currentFolder = $(element).text().trim();
      bookmarks.push(...parseBookmarksFromFolder($, element, currentFolder));
    });
  }

  return bookmarks;
};
