/**
 * Main file for MyFLix API. Lists all endpoints and routes that 
 * handle user interaction. 
 */


const express = require('express'); //import express
const morgan = require('morgan'); //import morgan 
const fs = require('fs'); //import built in node modules fs and path
const path = require('path');
require('./passport');
const uuid = require('uuid'); //generate unique ID's
const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' }); //create a write stream (in append mode) a 'log.txt' file is created in root directory

const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const Movies = Models.Movie;
const Users = Models.User;

const cors = require('cors');


const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_URI);



app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));
app.use(express.json());

let auth = require('./auth')(app);
const passport = require('passport');

/**
 * List of allowed origins to access the data
 */

const allowedOrigins = ['http://localhost:1234', 'http://localhost:4200', 'https://mymovieflix-a3c1af20a30e.herokuapp.com', 
    'https://knitflix.netlify.app', 'https://kamilaknits.github.io/myFlix-Angular-client/'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {//if a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

app.get('/', (req, res) => {
    res.send('Welcome to the Knitflix!');
});

/** 
 * Returns a list of all movies
 * using the GET method
 * 
 * @route GET /movies
**/
app.get('/movies',
    async (req, res) => {
        await Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

/** 
 * Returns info about a movie by Title
 * using the GET method
 * 
 * @route GET /movies/:Title
 * @param {string} - Title of movie
 * @returns {json} - Movie object
**/
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

/** 
 * Returns data about a particular genre
 * using the GET method
 * 
 * @route GET /movies/genre/:genre
 * @param {string} - genre
 * @returns {json} - Genre object
**/
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ "Genre.Name": req.params.genre })
            .then((movie) => {
                res.json(movie.Genre);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

/** 
 * Returns data about a director
 * using the GET method
 * 
 * @route GET /movies/directors/:directors
 * @param {string} - Director
 * @returns {json} - Director object
**/
app.get('/movies/directors/:director', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ "Director.Name": req.params.director })
            .then((movie) => {
                res.json(movie);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });

    });

/** 
 * Returns data on a user
 * using the GET method
 * 
 * @route GET /users/:Username
 * @param {string} - Username
 * @returns {string} - successful or unsuccessful loading of user's data
**/
    app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
        try {
          const user = await Users.findOne({ Username: req.params.Username });
          if (!user) {
            return res.status(404).send('User not found');
          }
          res.json(user);
        } catch (error) {
          console.error(error);
          res.status(500).send('Error: ' + error);
        }
      });
      
 /** 
 * Allows a new user to register
 * using the POST method
 * /* expect JSON in this format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}
 * 
 * @route POST /users
 * @param {interger} - ID
 * @param {string} - Username
 * @param {string} - Password
 * @param {string} - Email
 * @param {date} - Birthday
 * @returns {json} - newly registered user info
**/ 
app.post('/users',
    //validation logic here for request
    //excluded Passport strategies here
    //you can either use a chain of methods like .not().isEmpty() or use .isLength({min: 5})
    //which means minimum of 5 characters allowed only
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains no alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],

    async (req, res) => {

        //check for validation errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        await Users.findOne({ Username: req.body.Username })//search to see if a user with requested username already exists
            .then((user) => {
                if (user) {
                    //if the user is found, sned a response that it already exists
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });


/**
 *  Allows a user to update their info by username
 * using the PUT method
 * 
 * @route PUT  /users/:Username
 *
 * @param {string} - Username
 * @param {string} - Password
 * @param {string} - Email
 *
 * @returns {json} - newly updated user info

*/
app.put('/users/:Username',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains on alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //check for validation errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        //condition to check added here
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        //condition ends


        let hashedPassword = Users.hashPassword(req.body.Password);

        await Users.findOneAndUpdate({ Username: req.params.Username },
            {
                $set:
                {
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
            },
            { new: true }) //this line makes sure that the updated document is returned
            .then((updateUser) => {
                res.json(updateUser);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })

    });

/** 
 * Allows a user to add a movie to their favorite list
 * using the POST method
 * 
 * @route POST /users/:Username/movies/:MovieId
 * @param {string} - Username
 * @param {interger} - MovieId
 * @returns {json} - Favorite list of movies updated
**/
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //condition to check added here
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        //condition ends
        await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $push: { FavoriteMovies: req.params.MovieID } },
            { new: true }) //this line makes sure that the updated document is returned
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// allow user to remove a movie from their list of favorites //
/** 
 * Allows a user to remove a movie from their favorite list
 * using the DELETE method
 * 
 * @route DELETE /users/:Username/movies/:MovieId
 * @param {string} - Username
 * @param {interger} - MovieId
 * @returns {json} - Favorite movies list updated
**/
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //condition to check added here
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        //condition ends

        await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $pull: { FavoriteMovies: req.params.MovieID } },
            { new: true }) //this line makes sure that the updated document is returned
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });

    });

//delete user by username//
/**
 *  Allows a user to delete their account by username
 * using the DELETE method
 * 
 * @route DELETE  /users/:Username
 *
 * @param {string} - Username
 * @param {string} - Password
 * @param {string} - Email
 *
 * @returns {string} - successful or unsuccessful deregister alert

*/
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //condition to check added here
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        //condition ends

        await Users.findOneAndDelete(
            { Username: req.params.Username }
        )
            .then((user) => {
                if (!user) {
                    res.status(400).send(req.params.username + ' was not found');
                } else {
                    res.status(200).send(req.params.username + ' was deleted.');
                }
            })
            .catch((error) => {
                console.errror(error);
                req.status(500).send('Error: ' + error);
            });
    });


app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//port handling
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});


