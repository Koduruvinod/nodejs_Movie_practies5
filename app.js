const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db error :${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const converObjectToResponse = dbObj => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  }
}
//get all movies list

app.get('/movies/', async (request, response) => {
  const moviesList = `SELECT * FROM movie ORDER BY movie_id;`
  const moviesList_all = await db.all(moviesList)
  response.send(
    moviesList_all.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

// add the movie in last

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovie = `INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');`
  const dbResponse = await db.run(addMovie)
  response.send('Movie Successfully Added')
})

// Get single book in database

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movie_list_id = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const specfic_movie = await db.get(movie_list_id)
  response.send(converObjectToResponse(specfic_movie))
})
// Put update values movie

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateQuary = `UPDATE movie SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor ='${leadActor}'
  WHERE movie_id = ${movieId};`
  await db.run(updateQuary)
  response.send('Movie Details Updated')
})

// delete movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuary = `DELETE from movie WHERE movie_id = ${movieId}`
  const deleteResponse = await db.run(deleteQuary)
  response.send('Movie Removed')
})

// get all director
const converObjectToResponseDiretorTable = dbObj => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  }
}
const converObjectToResponseDiretorTableAllmovie = dbObj => {
  return {
    movie,
  }
}

app.get('/directors/', async (request, response) => {
  const director_list = `SELECT * FROM director ORDER BY director_id`
  const list_of_direc = await db.all(director_list)
  response.send(
    list_of_direc.map(eachDire => converObjectToResponseDiretorTable(eachDire)),
  )
})

//get all movie by one director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getAllMovie = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  const responseMovie = await db.all(getAllMovie)
  response.send(
    responseMovie.map(each => {
      movieName: each.movie_name
    }),
  )
})
module.exports = app
