import { sqliteTable, integer, text, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  year: integer('year').notNull(),
  rating: real('rating').notNull(),
  plot: text('plot').notNull(),
  posterUrl: text('poster_url'),
  runtime: integer('runtime').notNull(),
});

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const people = sqliteTable('people', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const moviesGenres = sqliteTable('movies_genres', {
  movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.genreId] }),
}));

export const movieActors = sqliteTable('movie_actors', {
  movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.personId] }),
}));

export const movieDirectors = sqliteTable('movie_directors', {
  movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.movieId, table.personId] }),
}));

// Relations
export const moviesRelations = relations(movies, ({ many }) => ({
  moviesGenres: many(moviesGenres),
  movieActors: many(movieActors),
  movieDirectors: many(movieDirectors),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  moviesGenres: many(moviesGenres),
}));

export const peopleRelations = relations(people, ({ many }) => ({
  movieActors: many(movieActors),
  movieDirectors: many(movieDirectors),
}));

export const moviesGenresRelations = relations(moviesGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [moviesGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [moviesGenres.genreId],
    references: [genres.id],
  }),
}));

export const movieActorsRelations = relations(movieActors, ({ one }) => ({
  movie: one(movies, {
    fields: [movieActors.movieId],
    references: [movies.id],
  }),
  person: one(people, {
    fields: [movieActors.personId],
    references: [people.id],
  }),
}));

export const movieDirectorsRelations = relations(movieDirectors, ({ one }) => ({
  movie: one(movies, {
    fields: [movieDirectors.movieId],
    references: [movies.id],
  }),
  person: one(people, {
    fields: [movieDirectors.personId],
    references: [people.id],
  }),
}));

// Types for the normalized structure
export type Movie = typeof movies.$inferSelect & {
  genres: string[];
  actors: string[];
  directors: string[];
};

export type NewMovie = Omit<typeof movies.$inferInsert, 'id'> & {
  id?: number;
  genres: string[];
  actors: string[];
  directors: string[];
};

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
