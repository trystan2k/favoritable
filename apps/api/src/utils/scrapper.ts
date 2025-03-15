import * as cheerio from 'cheerio';
import { cleanableString } from './string.js';
import { URLContentParseError } from '../errors/errors.js';
import { CreateBookmarkDTO } from '../db/schema/bookmark.schema.js';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
}

export const scrapper = async (url: string) => {
  let bookmarkData: CreateBookmarkDTO | null = null;
  try {
    const $ = await cheerio.fromURL(url, {
      requestOptions: {
        method: 'GET',
        headers
      }
    });

    const title = cleanableString($('head > title').text().trim() || $('meta[property="og:title"]').attr('content') || '');
    const description = cleanableString($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '');
    const publishedAt = $('meta[property="article:published_time"]').attr('content') || $('article[data-author-name]').find('time[datetime]').attr('datetime');

    bookmarkData = {
      url,
      title: title.removeCarriageReturns().removeLineBreaks().removeTabs().getResult(),
      slug: title.convertToSlug().getResult(),
      description: description.removeCarriageReturns().removeLineBreaks().removeTabs().getResult(),
      author: $('meta[name="author"]').attr('content') || $('article[data-author-name]').attr('data-author-name') || '',
      thumbnail: $('meta[property="og:image"]').attr('content') ?? '',
      publishedAt: publishedAt ? new Date(publishedAt) : null
    };

    return bookmarkData;
  } catch (error: unknown) {
    const errorData = error as Error;
    throw new URLContentParseError(errorData.message, error);
  }
}
