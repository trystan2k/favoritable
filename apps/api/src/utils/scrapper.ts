import * as cheerio from 'cheerio';
import { cleanableString } from './string.js';
import { URLContentParseError } from '../errors/errors.js';
import { CreateBookmarkDTO } from '../db/schema/bookmark.schema.js';

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


  return thumbnail;
}

export const scrapper = async (url: string) => {
  let bookmarkData: CreateBookmarkDTO | null = null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = cleanableString($('head > title').text().trim() || $('meta[property="og:title"]').attr('content') || '');

    bookmarkData = {
      url: response.url,
      title: title.removeCarriageReturns().removeLineBreaks().removeTabs().getResult(),
      slug: title.convertToSlug().getResult(),
      description: getDescription($),
      author: getAuthor($),
      thumbnail: getThumbnail($),
      publishedAt: getPublishedAt($)
    } as CreateBookmarkDTO;

    return bookmarkData;
  } catch (error: unknown) {
    const errorData = error as Error;
    throw new URLContentParseError(errorData.message, error);
  }
}
