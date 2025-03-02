CREATE TABLE labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    url TEXT NOT NULL,
    thumbnail TEXT,
    savedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    publishedAt DATETIME
);

CREATE TABLE bookmark_labels (
    bookmark_id INTEGER,
    label_id INTEGER,
    PRIMARY KEY (bookmark_id, label_id),
    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX idx_bookmark_labels_bookmark_id ON bookmark_labels(bookmark_id);
CREATE INDEX idx_bookmark_labels_label_id ON bookmark_labels(label_id);
CREATE INDEX idx_bookmarks_url ON bookmarks(url);
CREATE INDEX idx_bookmarks_title ON bookmarks(title);
CREATE INDEX idx_bookmarks_slug ON bookmarks(slug);