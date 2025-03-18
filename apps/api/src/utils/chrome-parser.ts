import * as cheerio from 'cheerio';
import { isValidUrl } from './url.js';
import { Element } from 'domhandler';

interface ChromeBookmark {
  url: string;
  folderName: string;
}

const parseBookmarksFromFolder = ($: cheerio.CheerioAPI, element: Element, currentFolder: string): ChromeBookmark[] => {
  const bookmarks: ChromeBookmark[] = [];
  const directDL = $(element).next('dl');
  const bookmarkList = directDL.children().filter('dt').children('a');

  bookmarkList.each((_, link) => {
    const url = $(link).attr('href');
    if (url && isValidUrl(url)) {
      bookmarks.push({
        url,
        folderName: currentFolder
      });
    }
  });
  return bookmarks;
};

export const parseChromebookmarks = (html: string, folderName?: string): ChromeBookmark[] => {
  const $ = cheerio.load(html);
  const bookmarks: ChromeBookmark[] = [];

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