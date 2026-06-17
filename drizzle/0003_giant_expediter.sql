DROP TABLE IF EXISTS `__bookmark_url_uniqueness_preflight`;--> statement-breakpoint
CREATE TABLE `__bookmark_url_uniqueness_preflight` (
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY (`user_id`, `url`)
);
--> statement-breakpoint
INSERT INTO `__bookmark_url_uniqueness_preflight` (`user_id`, `url`)
SELECT `user_id`, `url`
FROM `bookmark`;--> statement-breakpoint
DROP TABLE `__bookmark_url_uniqueness_preflight`;--> statement-breakpoint
CREATE UNIQUE INDEX `bookmark_userId_url_unique` ON `bookmark` (`user_id`,`url`);
