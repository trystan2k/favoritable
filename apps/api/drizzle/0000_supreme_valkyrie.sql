CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`author` text,
	`url` text NOT NULL,
	`thumbnail` text,
	`published_at` integer,
	`saved_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookmarks_labels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookmark_id` integer NOT NULL,
	`label_id` integer NOT NULL,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text
);
