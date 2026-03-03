CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`year` integer NOT NULL,
	`genres` text NOT NULL,
	`rating` real NOT NULL,
	`director` text NOT NULL,
	`actors` text NOT NULL,
	`plot` text NOT NULL,
	`poster_url` text,
	`runtime` integer NOT NULL
);
