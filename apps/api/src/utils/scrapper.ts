import * as cheerio from 'cheerio';
import { URLContentParseError } from '../errors/errors.js';
import { CreateBookmarkModel } from '../features/bookmarks/bookmark.models.js';
import { cleanableString } from './string.js';
import { BOOKMARK_STATES } from '../features/bookmarks/bookmark.constants.js';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
}

const getDescription = ($: cheerio.CheerioAPI) => {
  let description = $('meta[name="description"]').attr('content');

  if (!description) {
    description = $('meta[property="og:description"]').attr('content');
  }

  if (!description) {
    description = $('body').find('p').first().text();
  }

  return cleanableString(description).removeCarriageReturns().removeLineBreaks().removeTabs().getResult();
}

const getAuthor = ($: cheerio.CheerioAPI) => {
  let author = $('meta[name="author"]').attr('content');

  if (!author) {
    author = $('article[data-author-name]').attr('data-author-name');
  }

  if (!author) {
    author = $('.post-author').text();
  }

  return cleanableString(author).removeCarriageReturns().removeLineBreaks().removeTabs().getResult();
}

const getPublishedAt = ($: cheerio.CheerioAPI) => {
  let publishedAt = $('meta[property="article:published_time"]').attr('content');

  if (!publishedAt) {
    publishedAt = $('article[data-author-name]').find('time[datetime]').attr('datetime');
  }

  if (!publishedAt) {
    publishedAt = $('[datetime]').attr('datetime');
  }

  if (!publishedAt) {
    return null;
  }

  if (isNaN(Date.parse(publishedAt))) {
    // Try to find a date in the text
    const regex = /\{(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+)/;
    const match = publishedAt.match(regex);
    if (match && match[1]) {
      if (isNaN(Date.parse(match[1]))) {
        return null;
      } else {
        return new Date(match[1]);
      }
    } else {
      return null;
    }
  }

  return publishedAt ? new Date(publishedAt) : null;
}

const getThumbnail = ($: cheerio.CheerioAPI) => {
  let thumbnail = $('meta[property="og:image"]').attr('content');


  if (!thumbnail) {
    thumbnail = $('meta[name="og:image"]').attr('content');
  }

  if (!thumbnail) {
    thumbnail = $('meta[name="image"]').attr('content');
  }

  if (!thumbnail) {
    thumbnail = $('meta[property="twitter:image"]').attr('content');
  }

  if (!thumbnail) {
    thumbnail = $('article[data-author-name]').find('img').attr('src');
  }


  return thumbnail ?? null;
}

export const scrapper = async (url: string): Promise<CreateBookmarkModel> => {
  let bookmarkData: CreateBookmarkModel | null = null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = cleanableString($('head > title').text().trim() || $('meta[property="title"]').attr('content') || $('meta[property="og:title"]').attr('content') || '');

    bookmarkData = {
      url: response.url,
      title: title.removeCarriageReturns().removeLineBreaks().removeTabs().getResult(),
      slug: title.convertToSlug().getResult(),
      description: getDescription($),
      author: getAuthor($),
      thumbnail: getThumbnail($),
      publishedAt: getPublishedAt($),
      state: BOOKMARK_STATES.active,
      labels: []
    };

    return bookmarkData;
  } catch (error: unknown) {
    const errorData = error as Error;
    throw new URLContentParseError(errorData.message, error);
  }
}
