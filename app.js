const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// Get Movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
    SELECT
     * 
    FROM 
        movie 
    where 
        movie_id = ${movieId};`;
  const movie = await database.get(getMoviesQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

// API-2 POST Add new movie to movie_table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie ( director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;
  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// API-3 Returns a movie based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API-5 Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM 
            movie
        where 
        movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API-6 Returns a list of all directors in the director table
// directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

// API-7 Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
