import { db } from "../src/lib/db";
import {
  movies,
  genres,
  people,
  moviesGenres,
  movieActors,
  movieDirectors,
} from "../src/lib/db/schema";
import movieData from "../src/app/movielist.json";

// Raw movie data type from JSON
interface RawMovieData {
  id: number;
  title: string;
  year: string | number;
  runtime: string;
  genres: string[];
  director: string;
  actors: string;
  plot: string;
  posterUrl: string;
}

async function populateDatabase() {
  console.log("Starting database population...");

  try {
    // Clear existing data (in reverse order due to foreign keys)
    await db.delete(moviesGenres);
    await db.delete(movieActors);
    await db.delete(movieDirectors);
    await db.delete(movies);
    await db.delete(genres);
    await db.delete(people);
    console.log("Cleared existing data");

    // Collect all unique genres and people
    const allGenres = new Set<string>();
    const allPeople = new Set<string>();

    (movieData.movies as RawMovieData[]).forEach((movie) => {
      movie.genres.forEach((genre) => allGenres.add(genre));

      // Add director(s) - split by comma and clean
      const directors = movie.director
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);
      directors.forEach((director) => allPeople.add(director));

      // Add actors - split by comma and clean
      const actors = movie.actors
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      actors.forEach((actor) => allPeople.add(actor));
    });

    // Insert genres first
    const genreRecords = Array.from(allGenres).map((genreName) => ({
      name: genreName,
    }));
    await db.insert(genres).values(genreRecords);
    console.log(`Inserted ${genreRecords.length} genres`);

    // Insert people
    const peopleRecords = Array.from(allPeople).map((personName) => ({
      name: personName,
    }));
    const peopleBatchSize = 100;
    for (let i = 0; i < peopleRecords.length; i += peopleBatchSize) {
      const batch = peopleRecords.slice(i, i + peopleBatchSize);
      await db.insert(people).values(batch);
    }
    console.log(`Inserted ${peopleRecords.length} people`);

    // Get all genres and people with their IDs
    const [insertedGenres, insertedPeople] = await Promise.all([
      db.select().from(genres),
      db.select().from(people),
    ]);

    const genreMap = new Map<string, number>();
    const peopleMap = new Map<string, number>();

    insertedGenres.forEach((genre) => genreMap.set(genre.name, genre.id));
    insertedPeople.forEach((person) => peopleMap.set(person.name, person.id));

    // Transform and insert movie data (without people relationships)
    const movieRecords = (movieData.movies as RawMovieData[]).map((movie) => {
      const runtime = parseInt(movie.runtime);
      return {
        id: movie.id,
        title: movie.title,
        year:
          typeof movie.year === "string" ? parseInt(movie.year) : movie.year,
        runtime: isNaN(runtime) ? 0 : runtime,
        plot: movie.plot,
        posterUrl: movie.posterUrl || null,
        rating: 0,
      };
    });

    // Insert movies in batches
    const movieBatchSize = 100;
    for (let i = 0; i < movieRecords.length; i += movieBatchSize) {
      const batch = movieRecords.slice(i, i + movieBatchSize);
      await db.insert(movies).values(batch);
      console.log(
        `Inserted movie batch ${Math.floor(i / movieBatchSize) + 1}/${Math.ceil(
          movieRecords.length / movieBatchSize
        )}`
      );
    }

    // Create all relationship records
    const movieGenreRecords: { movieId: number; genreId: number }[] = [];
    const movieActorRecords: { movieId: number; personId: number }[] = [];
    const movieDirectorRecords: { movieId: number; personId: number }[] = [];

    (movieData.movies as RawMovieData[]).forEach((movie) => {
      // Genre relationships
      movie.genres.forEach((genreName) => {
        const genreId = genreMap.get(genreName);
        if (genreId) {
          movieGenreRecords.push({ movieId: movie.id, genreId });
        }
      });

      // Director relationships
      const directors = movie.director
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);
      directors.forEach((directorName) => {
        const personId = peopleMap.get(directorName);
        if (personId) {
          movieDirectorRecords.push({ movieId: movie.id, personId });
        }
      });

      // Actor relationships
      const actors = movie.actors
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      actors.forEach((actorName) => {
        const personId = peopleMap.get(actorName);
        if (personId) {
          movieActorRecords.push({ movieId: movie.id, personId });
        }
      });
    });

    // Insert all relationships in batches
    const relationBatchSize = 500;

    // Movie-Genre relationships
    for (let i = 0; i < movieGenreRecords.length; i += relationBatchSize) {
      const batch = movieGenreRecords.slice(i, i + relationBatchSize);
      await db.insert(moviesGenres).values(batch);
      console.log(
        `Inserted genre relations batch ${
          Math.floor(i / relationBatchSize) + 1
        }/${Math.ceil(movieGenreRecords.length / relationBatchSize)}`
      );
    }

    // Movie-Actor relationships
    for (let i = 0; i < movieActorRecords.length; i += relationBatchSize) {
      const batch = movieActorRecords.slice(i, i + relationBatchSize);
      await db.insert(movieActors).values(batch);
      console.log(
        `Inserted actor relations batch ${
          Math.floor(i / relationBatchSize) + 1
        }/${Math.ceil(movieActorRecords.length / relationBatchSize)}`
      );
    }

    // Movie-Director relationships
    for (let i = 0; i < movieDirectorRecords.length; i += relationBatchSize) {
      const batch = movieDirectorRecords.slice(i, i + relationBatchSize);
      await db.insert(movieDirectors).values(batch);
      console.log(
        `Inserted director relations batch ${
          Math.floor(i / relationBatchSize) + 1
        }/${Math.ceil(movieDirectorRecords.length / relationBatchSize)}`
      );
    }

    console.log(`Successfully populated database with:`);
    console.log(`- ${movieRecords.length} movies`);
    console.log(`- ${genreRecords.length} genres`);
    console.log(`- ${peopleRecords.length} people`);
    console.log(`- ${movieGenreRecords.length} movie-genre relationships`);
    console.log(`- ${movieActorRecords.length} movie-actor relationships`);
    console.log(
      `- ${movieDirectorRecords.length} movie-director relationships`
    );
  } catch (error) {
    console.error("Error populating database:", error);
    process.exit(1);
  }
}

populateDatabase();
