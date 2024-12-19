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
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB');
mongoose.connect(process.env.CONNECTION_URI);


app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));
app.use(express.json());

let auth = require('./auth')(app);
const passport = require('passport');

const allowedOrigins = ['http://localhost:8080', 'https://mymovieflix-a3c1af20a30e.herokuapp.com/'];
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){//if a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false) ; 
        }
        return callback(null, true);
    }
}));

app.get('/', (req, res) => {
    res.send('Welcome to the MyFlix!');
});

// get list of all movies//

app.get('/movies', passport.authenticate('jwt', { session: false }),
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

// get data about a movie by title//

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

// get data about a genre //

app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ "Genre.Name": req.params.genre })
            .then((movie) => {
                res.json(movie);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// get data about a director//

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

//allow a new user to register // excluded Passport strategies here

/* expect JSON in this format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}*/

app.post('/users',
    //validation logic here for request
    //you can either use a chain of methods like .not().isEmpty() or use .isLength({min: 5})
    //which means minimum of 5 characters allowed only
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains on alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {

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
                        .then((user) => { res.send(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });


// allow a user to update their info by username// might need to add validation point just like in add new user
/* expect a json in this format
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date, (required)
}
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
        await Users.findOneAndUpdate({ Username: req.params.Username },
            {
                $set:
                {
                    Username: req.body.Username,
                    Password: req.body.Password,
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

//add a movie to a user's favorite movies list//

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});


