import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { LibraryBookmarkListItem } from '@/features/bookmarks/lib/bookmark-library';

import styles from './BookmarkLibraryPage.module.css';

type BookmarkLibraryPageProps = {
  bookmarks: LibraryBookmarkListItem[];
};

export function BookmarkLibraryPage({ bookmarks }: BookmarkLibraryPageProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="bookmark-library-heading" className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{t('bookmarks.library.eyebrow')}</p>
          <h2 className={styles.heading} id="bookmark-library-heading">
            {t('bookmarks.library.heading')}
          </h2>
          <p className={styles.body}>{t('bookmarks.library.body')}</p>
        </div>

        <Link className={styles.primaryAction} to="/bookmarks/new">
          {t('bookmarks.library.actions.add')}
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>{t('bookmarks.library.empty.title')}</p>
          <p className={styles.emptyBody}>{t('bookmarks.library.empty.body')}</p>
        </div>
      ) : (
        <ol className={styles.list}>
          {bookmarks.map((bookmark) => (
            <li className={styles.listItem} key={bookmark.id}>
              <article className={styles.bookmarkCard}>
                <div className={styles.bookmarkCopy}>
                  <h3 className={styles.bookmarkTitle}>{bookmark.title}</h3>
                  <a
                    aria-label={`${bookmark.url} ${t('bookmarks.library.linkOpensInNewTab')}`}
                    className={styles.bookmarkUrl}
                    href={bookmark.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {bookmark.url}
                    <span className={styles.visuallyHidden}>
                      {' '}
                      {t('bookmarks.library.linkOpensInNewTab')}
                    </span>
                  </a>
                  {bookmark.description ? (
                    <p className={styles.bookmarkDescription}>{bookmark.description}</p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
