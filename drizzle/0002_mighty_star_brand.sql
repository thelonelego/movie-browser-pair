CREATE TABLE `movie_actors` (
	`movie_id` integer NOT NULL,
	`person_id` integer NOT NULL,
	PRIMARY KEY(`movie_id`, `person_id`),
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `movie_directors` (
	`movie_id` integer NOT NULL,
	`person_id` integer NOT NULL,
	PRIMARY KEY(`movie_id`, `person_id`),
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_name_unique` ON `people` (`name`);--> statement-breakpoint
ALTER TABLE `movies` DROP COLUMN `director`;--> statement-breakpoint
ALTER TABLE `movies` DROP COLUMN `actors`;