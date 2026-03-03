import { db } from './db';
import { movies, genres, people, moviesGenres, movieActors, movieDirectors, type Movie, type NewMovie, type Genre, type Person } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import Fuse from 'fuse.js';

class MovieStore {
  private fuse: Fuse<Movie> | null = null;

  constructor() {
    this.initializeFuse();
  }

  private async initializeFuse() {
    const allMovies = await this.getAllMovies();
    this.fuse = new Fuse(allMovies, {
      keys: ['title'],
      threshold: 0.3, // Similar to the 70% threshold in the C# version
      includeScore: true
    });
  }

  private async updateFuseIndex() {
    const allMovies = await this.getAllMovies();
    this.fuse = new Fuse(allMovies, {
      keys: ['title'],
      threshold: 0.3,
      includeScore: true
    });
  }

  async getAllMovies(): Promise<Movie[]> {
    // Get all movies first
    const allMovies = await db.select().from(movies);
    
    // Get all movie relationships in parallel for better performance
    const [movieGenresResult, movieActorsResult, movieDirectorsResult] = await Promise.all([
      db.select({
        movieId: moviesGenres.movieId,
        name: genres.name,
      }).from(moviesGenres)
        .innerJoin(genres, eq(moviesGenres.genreId, genres.id)),
      
      db.select({
        movieId: movieActors.movieId,
        name: people.name,
      }).from(movieActors)
        .innerJoin(people, eq(movieActors.personId, people.id)),
      
      db.select({
        movieId: movieDirectors.movieId,
        name: people.name,
      }).from(movieDirectors)
        .innerJoin(people, eq(movieDirectors.personId, people.id)),
    ]);

    // Create lookup maps for efficient grouping
    const genresByMovie = new Map<number, string[]>();
    const actorsByMovie = new Map<number, string[]>();
    const directorsByMovie = new Map<number, string[]>();

    movieGenresResult.forEach(({ movieId, name }) => {
      if (!genresByMovie.has(movieId)) genresByMovie.set(movieId, []);
      genresByMovie.get(movieId)!.push(name);
    });

    movieActorsResult.forEach(({ movieId, name }) => {
      if (!actorsByMovie.has(movieId)) actorsByMovie.set(movieId, []);
      actorsByMovie.get(movieId)!.push(name);
    });

    movieDirectorsResult.forEach(({ movieId, name }) => {
      if (!directorsByMovie.has(movieId)) directorsByMovie.set(movieId, []);
      directorsByMovie.get(movieId)!.push(name);
    });

    // Combine all data
    return allMovies.map(movie => ({
      ...movie,
      genres: genresByMovie.get(movie.id) || [],
      actors: actorsByMovie.get(movie.id) || [],
      directors: directorsByMovie.get(movie.id) || [],
    }));
  }

  async getMovieById(id: number): Promise<Movie | undefined> {
    // Get the movie
    const movieResult = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
    if (movieResult.length === 0) return undefined;
    
    const movie = movieResult[0];
    
    // Get all relationships for this movie in parallel
    const [movieGenresData, movieActorsData, movieDirectorsData] = await Promise.all([
      db.select({ name: genres.name })
        .from(moviesGenres)
        .innerJoin(genres, eq(moviesGenres.genreId, genres.id))
        .where(eq(moviesGenres.movieId, id)),

      db.select({ name: people.name })
        .from(movieActors)
        .innerJoin(people, eq(movieActors.personId, people.id))
        .where(eq(movieActors.movieId, id)),

      db.select({ name: people.name })
        .from(movieDirectors)
        .innerJoin(people, eq(movieDirectors.personId, people.id))
        .where(eq(movieDirectors.movieId, id)),
    ]);

    return {
      ...movie,
      genres: movieGenresData.map(g => g.name),
      actors: movieActorsData.map(a => a.name),
      directors: movieDirectorsData.map(d => d.name),
    };
  }

  async searchMovies(query: string): Promise<Movie[]> {
    if (!this.fuse) {
      await this.initializeFuse();
    }
    
    if (!this.fuse) return [];
    
    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }

  filterByGenre(movies: Movie[], genre: string): Movie[] {
    const cleanGenre = this.toTitleCase(genre);
    return movies.filter(m => m.genres.includes(cleanGenre));
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  async addMovie(movie: Omit<NewMovie, 'id'>): Promise<Movie> {
    return await db.transaction(async (tx) => {
      // Insert the movie (without relationships)
      const movieToInsert = {
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        plot: movie.plot,
        posterUrl: movie.posterUrl,
        runtime: movie.runtime,
      };

      const [insertedMovie] = await tx.insert(movies).values(movieToInsert).returning();
      
      // Handle genres
      for (const genreName of movie.genres) {
        let [genre] = await tx.select().from(genres).where(eq(genres.name, genreName));
        if (!genre) {
          [genre] = await tx.insert(genres).values({ name: genreName }).returning();
        }
        
        await tx.insert(moviesGenres).values({
          movieId: insertedMovie.id,
          genreId: genre.id,
        });
      }
      
      // Handle actors
      for (const actorName of movie.actors) {
        let [person] = await tx.select().from(people).where(eq(people.name, actorName));
        if (!person) {
          [person] = await tx.insert(people).values({ name: actorName }).returning();
        }
        
        await tx.insert(movieActors).values({
          movieId: insertedMovie.id,
          personId: person.id,
        });
      }
      
      // Handle directors
      for (const directorName of movie.directors) {
        let [person] = await tx.select().from(people).where(eq(people.name, directorName));
        if (!person) {
          [person] = await tx.insert(people).values({ name: directorName }).returning();
        }
        
        await tx.insert(movieDirectors).values({
          movieId: insertedMovie.id,
          personId: person.id,
        });
      }
      
      await this.updateFuseIndex();
      
      return {
        ...insertedMovie,
        genres: movie.genres,
        actors: movie.actors,
        directors: movie.directors,
      };
    });
  }

  async updateMovie(id: number, movie: Partial<Omit<NewMovie, 'id'>>): Promise<Movie | null> {
    return await db.transaction(async (tx) => {
      // Update movie basic info (excluding relationships)
      const movieToUpdate: Partial<{
        title: string;
        year: number;
        rating: number;
        plot: string;
        posterUrl: string | null;
        runtime: number;
      }> = {};
      
      if (movie.title !== undefined) movieToUpdate.title = movie.title;
      if (movie.year !== undefined) movieToUpdate.year = movie.year;
      if (movie.rating !== undefined) movieToUpdate.rating = movie.rating;
      if (movie.plot !== undefined) movieToUpdate.plot = movie.plot;
      if (movie.posterUrl !== undefined) movieToUpdate.posterUrl = movie.posterUrl;
      if (movie.runtime !== undefined) movieToUpdate.runtime = movie.runtime;

      if (Object.keys(movieToUpdate).length > 0) {
        const result = await tx.update(movies)
          .set(movieToUpdate)
          .where(eq(movies.id, id))
          .returning();

        if (result.length === 0) return null;
      }

      // Handle genres if they're being updated
      if (movie.genres !== undefined) {
        await tx.delete(moviesGenres).where(eq(moviesGenres.movieId, id));
        
        for (const genreName of movie.genres) {
          let [genre] = await tx.select().from(genres).where(eq(genres.name, genreName));
          if (!genre) {
            [genre] = await tx.insert(genres).values({ name: genreName }).returning();
          }
          
          await tx.insert(moviesGenres).values({
            movieId: id,
            genreId: genre.id,
          });
        }
      }

      // Handle actors if they're being updated
      if (movie.actors !== undefined) {
        await tx.delete(movieActors).where(eq(movieActors.movieId, id));
        
        for (const actorName of movie.actors) {
          let [person] = await tx.select().from(people).where(eq(people.name, actorName));
          if (!person) {
            [person] = await tx.insert(people).values({ name: actorName }).returning();
          }
          
          await tx.insert(movieActors).values({
            movieId: id,
            personId: person.id,
          });
        }
      }

      // Handle directors if they're being updated
      if (movie.directors !== undefined) {
        await tx.delete(movieDirectors).where(eq(movieDirectors.movieId, id));
        
        for (const directorName of movie.directors) {
          let [person] = await tx.select().from(people).where(eq(people.name, directorName));
          if (!person) {
            [person] = await tx.insert(people).values({ name: directorName }).returning();
          }
          
          await tx.insert(movieDirectors).values({
            movieId: id,
            personId: person.id,
          });
        }
      }

      await this.updateFuseIndex();
      
      // Return the updated movie with all relationships
      return await this.getMovieById(id) || null;
    });
  }

  async deleteMovie(id: number): Promise<boolean> {
    const result = await db.delete(movies).where(eq(movies.id, id)).returning();
    if (result.length > 0) {
      await this.updateFuseIndex();
      return true;
    }
    return false;
  }

  async getMovieCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(movies);
    return Number(result[0].count);
  }

  async getAllGenres(): Promise<Genre[]> {
    return await db.select().from(genres).orderBy(genres.name);
  }

  async getAllPeople(): Promise<Person[]> {
    return await db.select().from(people).orderBy(people.name);
  }

  async getActors(): Promise<Person[]> {
    const result = await db
      .selectDistinct({ id: people.id, name: people.name })
      .from(people)
      .innerJoin(movieActors, eq(people.id, movieActors.personId))
      .orderBy(people.name);
    return result;
  }

  async getDirectors(): Promise<Person[]> {
    const result = await db
      .selectDistinct({ id: people.id, name: people.name })
      .from(people)
      .innerJoin(movieDirectors, eq(people.id, movieDirectors.personId))
      .orderBy(people.name);
    return result;
  }
}

// Export singleton instance
export const movieStore = new MovieStore();
