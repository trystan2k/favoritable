import puppeteer, { type Page } from "puppeteer";
import { CreateBookmarkModel } from "../features/bookmarks/bookmark.models.js";
import { BOOKMARK_STATES } from "../features/bookmarks/bookmark.constants.js";
import { URLContentParseError } from "../errors/errors.js";
import { cleanableString } from "../utils/string.js";

const getTitle = async (page: Page) => {
  let title = await page.title();

  if (!title) {
    title = await page.$eval('head > title', (el) => el.textContent).catch(() => null);
  }

  if (!title) {
    title = await page.$eval('meta[property="title"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  if (!title) {
    title = await page.$eval('meta[property="og:title"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  return cleanableString(title).removeCarriageReturns().removeLineBreaks().removeTabs();
}

const getDescription = async (page: Page) => {
  let description = await page.$eval('meta[name="description"]', (el) => el.getAttribute('content')).catch(() => null);

  if (!description) {
    description = await page.$eval('meta[property="og:description"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  if (!description) {
    description = await page.$eval('body > p', (el) => el.textContent).catch(() => null);
  }

  if (!description) {
    description = await page.$eval('[data-testid="tweetText"]', (el) => el.textContent).catch(() => null);
  }

  if (!description) {
    description = await page.$eval('article', (el) => el.textContent).catch(() => null);
  }

  return cleanableString(description).removeCarriageReturns().removeLineBreaks().removeTabs().getResult();
}

const getAuthor = async (page: Page) => {
  let author = await page.$eval('meta[name="author"]', (el) => el.getAttribute('content')).catch(() => null);

  if (!author) {
    author = await page.$eval('article[data-author-name]', (el) => el.getAttribute('data-author-name')).catch(() => null);
  }

  if (!author) {
    author = await page.$eval('.post-author', (el) => el.textContent).catch(() => null);
  }

  if (!author) {
    author = await page.$eval('[data-testid="User-Name"] > div', (el) => el.textContent).catch(() => null);
  }

  return cleanableString(author).removeCarriageReturns().removeLineBreaks().removeTabs().getResult();
}

const getPublishedAt = async (page: Page) => {
  let publishedAt = await page.$eval('meta[property="article:published_time"]', (el) => el.getAttribute('content')).catch(() => null);

  if (!publishedAt) {
    publishedAt = await page.$eval('article[data-author-name] > time[datetime]', (el) => el.getAttribute('datetime')).catch(() => null);
  }

  if (!publishedAt) {
    publishedAt = await page.$eval('[datetime]', (el) => el.getAttribute('datetime')).catch(() => null);
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

const getThumbnail = async (page: Page) => {
  let thumbnail = await page.$eval('meta[property="og:image"]', (el) => el.getAttribute('content')).catch(() => null);


  if (!thumbnail) {
    thumbnail = await page.$eval('meta[name="og:image"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  if (!thumbnail) {
    thumbnail = await page.$eval('meta[name="image"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  if (!thumbnail) {
    thumbnail = await page.$eval('meta[property="twitter:image"]', (el) => el.getAttribute('content')).catch(() => null);
  }

  if (!thumbnail) {
    thumbnail = await page.$eval('article[data-author-name] > img', (el) => el.getAttribute('src')).catch(() => null);
  }


  return thumbnail ?? null;
}

export const scrapper = async (url: string): Promise<CreateBookmarkModel> => {
  let bookmarkData: CreateBookmarkModel | null = null;
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const title = await getTitle(page);

    bookmarkData = {
      url,
      title: title.removeCarriageReturns().removeLineBreaks().removeTabs().getResult(),
      slug: title.convertToSlug().getResult(),
      description: await getDescription(page),
      author: await getAuthor(page),
      thumbnail: await getThumbnail(page),
      publishedAt: await getPublishedAt(page),
      state: BOOKMARK_STATES.active,
      labels: []
    }

    return bookmarkData;
  } catch (error) {
    const errorData = error as Error;
    throw new URLContentParseError(errorData.message, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
