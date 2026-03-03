# Movie Browser - Next.js Application

A full-stack movie browser application built with Next.js and SQLite that allows users to browse, search, and manage a collection of movies with persistent data storage.

## Features

- **Browse Movies**: View movies in a responsive grid layout with posters and basic information
- **Search**: Fuzzy text search through movie titles
- **Movie Details**: View detailed information including plot, cast, director, and more
- **CRUD Operations**:
  - Create new movies with multiple directors/actors
  - Edit existing movies
  - Delete movies with cascading relationships
- **Responsive Design**: Works on desktop and mobile devices
- **Persistent Database**: SQLite with normalized schema for data integrity

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Search**: Fuse.js for fuzzy text search
- **Data Storage**: Normalized SQLite database with persistent storage
- **Migration Tools**: Drizzle Kit for schema management

## Architecture

### Backend (API Routes)
- `GET /api/movies` - List movies with search, filtering, and pagination
- `POST /api/movies` - Create new movie
- `GET /api/movies/[id]` - Get specific movie
- `PUT /api/movies/[id]` - Update movie
- `DELETE /api/movies/[id]` - Delete movie

### Frontend (Pages)
- `/` - Main movie list page with search
- `/movies/[id]` - Movie detail page
- `/movies/[id]/edit` - Edit movie form
- `/movies/new` - Create new movie form

### Database Schema
- **Normalized Design**: Separate tables for movies, genres, and people
- **Many-to-Many Relations**: Junction tables for genre/actor/director relationships
- **Data Integrity**: Foreign key constraints and cascading deletes
- **Efficient Queries**: Optimized JOINs and parallel database operations

### Data Management
- **SQLite Database**: Persistent storage with ACID transactions
- **Drizzle ORM**: Type-safe database operations and migrations
- **MovieStore Class**: Abstraction layer with async database methods
- **Fuzzy Search**: Fuse.js provides intelligent search functionality

## Setup and Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Populate database with movie data
   npm run db:populate
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:populate` - Populate database from JSON data

## Project Structure

```
src/
├── app/
│   ├── api/movies/          # API routes
│   │   ├── route.ts         # GET/POST /api/movies
│   │   └── [id]/route.ts    # GET/PUT/DELETE /api/movies/[id]
│   ├── movies/              # Movie pages
│   │   ├── [id]/
│   │   │   ├── page.tsx     # Movie detail page
│   │   │   └── edit/page.tsx # Edit movie page
│   │   └── new/page.tsx     # Create movie page
│   ├── components/          # shadcn/ui components
│   ├── types/
│   │   └── movie.ts         # TypeScript type definitions
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (movie list)
│   └── movielist.json       # Movie seed data
├── lib/
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   └── schema.ts        # Drizzle schema definitions
│   ├── movieStore.ts        # Database abstraction layer
│   └── utils.ts             # Utility functions
├── scripts/
│   └── populate-db.ts       # Database population script
├── drizzle/                 # Database migrations
├── drizzle.config.ts        # Drizzle configuration
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json
```

## Migration from Original Architecture

This application was migrated from a separated frontend (React/Vite) and backend (ASP.NET Core) to a unified Next.js application:

### What Was Migrated
- ✅ All movie data (206+ movies with complete relationships)
- ✅ Fuzzy search functionality (FuzzySharp → Fuse.js)
- ✅ CRUD operations with data persistence
- ✅ Movie listing with pagination and filtering
- ✅ Movie detail views with normalized data
- ✅ Edit/Create forms supporting multiple directors/actors
- ✅ Modern UI with shadcn/ui components
- ✅ Responsive grid layout

### What Was Improved
- **Persistent Database**: SQLite with normalized schema
- **Data Integrity**: Foreign key constraints and transactions
- **Better Performance**: Efficient database queries and caching
- **Type Safety**: Full TypeScript with Drizzle ORM
- **Modern UI**: Tailwind CSS with shadcn/ui components
- **Scalable Architecture**: Proper database normalization

### What Was Changed
- In-memory storage → SQLite database with Drizzle ORM
- CSS styling → Tailwind CSS with component system
- Simple data structure → Normalized relational database
- Basic search → Optimized database queries with fuzzy search
- Manual data management → Automated migrations and seeding

## API Documentation

### Get Movies
```
GET /api/movies?query=string&genre=string&year=number&sort=string&page=number&moviesPerPage=number
```
Returns paginated list of movies with optional search and filtering.

### Get Movie
```
GET /api/movies/[id]
```
Returns specific movie by ID.

### Create Movie
```
POST /api/movies
Content-Type: application/json

{
  "title": "Movie Title",
  "year": 2023,
  "runtime": 120,
  "rating": 8.5,
  "genres": ["Action", "Drama"],
  "directors": ["Director Name", "Co-Director"],
  "actors": ["Actor 1", "Actor 2", "Actor 3"],
  "plot": "Movie plot description",
  "posterUrl": "https://example.com/poster.jpg"
}
```

### Update Movie
```
PUT /api/movies/[id]
Content-Type: application/json

{
  "id": 1,
  "title": "Updated Title",
  // ... other fields
}
```

### Delete Movie
```
DELETE /api/movies/[id]
```

## Database Schema

The application uses a normalized SQLite database with the following tables:

### Core Tables
- **movies**: Core movie data (title, year, runtime, rating, plot, posterUrl)
- **genres**: Unique genre names (Action, Drama, Comedy, etc.)
- **people**: All actors and directors (unified table)

### Junction Tables (Many-to-Many)
- **movies_genres**: Links movies to their genres
- **movie_actors**: Links movies to their actors
- **movie_directors**: Links movies to their directors

### Key Features
- **Person can be both actor and director** in different movies
- **Multiple directors per movie** supported
- **Cascading deletes** maintain data integrity
- **Foreign key constraints** prevent orphaned records

## Future Improvements

- ✅ ~~Add persistent database (SQLite, PostgreSQL)~~ **COMPLETED**
- Add image upload for movie posters
- Add user authentication and favorites
- Implement advanced filtering by actors/directors
- Add movie ratings and reviews system
- Implement infinite scroll pagination
- Add bulk operations (import/export)
- Add full-text search capabilities
- Implement caching strategies with Redis
- Add comprehensive test suite (Jest, React Testing Library)
- Add analytics dashboard for movie statistics

## Development

The application uses:
- **TypeScript** for type safety across the entire stack
- **Drizzle ORM** for type-safe database operations
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for consistent component design
- **React Server Components** for better performance
- **Client Components** where interactivity is needed
- **Next.js API Routes** for backend functionality

### Adding New Features

1. **Database Changes**:
   ```bash
   # Modify schema in src/lib/db/schema.ts
   npm run db:generate  # Generate migration
   npm run db:migrate   # Apply migration
   ```

2. **New Pages**: Create in `src/app/`
3. **API Routes**: Add in `src/app/api/`
4. **Components**: Use shadcn/ui components in `src/components/ui/`
5. **Types**: Update `src/app/types/` and database schema
6. **Database Layer**: Extend MovieStore class with new methods

### Database Operations

The MovieStore class provides async methods for:
- `getAllMovies()` - Fetch all movies with relationships
- `getMovieById(id)` - Get single movie with full data
- `addMovie(movie)` - Create new movie with relationships
- `updateMovie(id, movie)` - Update existing movie
- `deleteMovie(id)` - Delete with cascading relationships
- `getAllGenres()` - Get all genres
- `getAllPeople()` - Get all actors/directors
