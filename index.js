const express = require("express");
morgan = require('morgan');
fs = require('fs'), //import built in node modules fs and path
    path = require('path');
const uuid = require('uuid');
const app = express();
//create a write stream (in append mode)
//a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://127.0.0.1:27017/cfDB');
mongoose.connect(process.env.CONNECTION_URI);

let movies = [
    {
        "title": 'Death Becomes Her',
        "description": 'When a fading actress learns of an immortality treatment, she sees it as a way to outdo her long-time rival.',
        "director": {
            "name": 'Robert Zemeckis',
            "bio": 'A whiz-kid with special effects, Robert is from the Spielberg camp of film-making. Steven Spielberg produced many of his films. Usually working with writing partner Bob Gale, Robert\'s earlier films show he has a talent for zany comedy Romancing the Stone, 1941, and special effect vehicles in Who Framed Roger Rabbit and Back to the Future.',
            "birth year": '1952',
            "death year": ''
        },
        "genre": {
            "name": 'Body Horror',
            "description": 'The body horror subgenre features the physical and psychological transformation, deformation, or degradation of the human body. In body horror stories, the human body itself becomes a source of fear, anxiety, and disgust, often through graphic and disturbing depictions of bodily changes, mutilation, or alteration.'
        },
    },

    {
        "title": 'The Princess Bride',
        "description": 'A bedridden boy\'s grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies and allies in his quest to be reunited with his true love.',
        "director": {
            "name": 'Rob Reiner',
            "bio": 'Robert Reiner was born in New York City, to Estelle Reiner (née Lebost) and Emmy-winning actor, comedian, writer, and producer Carl Reiner. As a child, his father was his role model, as Carl Reiner created and starred in The Dick Van Dyke Show.',
            "birth year": '1947',
            "death year": ''
        },
        "genre": {
            "name": 'Adventure Epic',
            "description": 'The adventure epic subgenre features grand scope, sweeping landscapes, heroic journeys, and often historical or mythological elements. Epic adventure stories transport audiences to different worlds, eras, or fantastical realms, immersing them in narratives that encompass vast territories and significant challenges.'
        },

    },
    {
        "title": 'The Emperor\'s New Groove',
        "description": 'Emperor Kuzco is turned into a llama by his ex-administrator Yzma, and must now regain his throne with the help of Pacha, the gentle llama herder.',
        "director": {
            "name": 'Mark Dindal',
            "bio": 'Mark Dindal is an American animation film director, writer and voice actor from Columbus, Ohio who is known for directing the comedy classic Disney film The Emperor\'s New Groove. He is also known for directing Warner Brothers\' musical Cats Don\'t Dance and Disney\'s Chicken Little.',
            "birth year": '1960',
            "death year": ''
        },
        "genre": {
            "name": 'Comedy',
            "description": 'The comedy genre refers to a category of entertainment that aims to amuse and entertain audiences by using humor, wit, and comedic situations. Comedies are created with the primary intention of eliciting laughter and providing lighthearted enjoyment.'
        },

    },
    {
        "title": 'Back to the Future',
        "description": 'Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.',
        "director": {
            "name": 'Robert Zemeckis',
            "bio": 'A whiz-kid with special effects, Robert is from the Spielberg camp of film-making. Steven Spielberg produced many of his films. Usually working with writing partner Bob Gale, Robert\'s earlier films show he has a talent for zany comedy Romancing the Stone, 1941, and special effect vehicles in Who Framed Roger Rabbit and Back to the Future.',
            "birth year": '1947',
            "death year": '',
        },
        "genre": {
            "name": 'High-Concept Comedy',
            "description": 'The high-concept comedy subgenre features a distinctive and easily understandable premise that grabs the audience\'s attention. High-concept comedies typically focus on "what if..." scenarios (e.g., what if a lawyer couldn\'t lie) or "fish out of water" situations (e.g., a tough cop must pose undercover as a kindergarten teacher).',

        },
    },
    {
        "title": 'Moana',
        "description": 'In ancient Polynesia, when a terrible curse incurred by the demigod Maui reaches Moana\'s island, she answers the Ocean\'s call to seek out Maui to set things right.',
        "director": {
            "name": 'Ron Clements',
            "bio": 'Ron Clements is an American animated film director who collaborates with John Musker. They directed various Disney animated films including The Great Mouse Detective, The Little Mermaid, Aladdin, Hercules, Treasure Planet, The Princess and the Frog and Moana. The Little Mermaid and Aladdin are seminal films he co-directed because they brought back life to Disney animation in the late 1980s and early 1990s.',
            "birth year": '1953',
            "death year": '',
        },
        "genre": {
            "name": 'Comedy',
            "description": 'The comedy genre refers to a category of entertainment that aims to amuse and entertain audiences by using humor, wit, and comedic situations. Comedies are created with the primary intention of eliciting laughter and providing lighthearted enjoyment.',

        },
    },
    {
        "title": 'Runaway Bride',
        "description": 'For his latest column in USA Today, Ike Graham writes about Maggie, who always leaves all her fiances standing at the altar. He is fired as she complains to the newspaper for inaccuracies in her story.',
        "director": {
            "name": 'Garry Marshall',
            "bio": 'Garry Kent Marshall (November 13, 1934 - July 19, 2016) was an American actor and filmmaker. He started his career in the 1960s writing for The Lucy Show and The Dick Van Dyke Show before he developed Neil Simon\'s 1965 play The Odd Couple for television in 1970. He gained fame for creating Happy Days (1974-1984), Laverne and Shirley (1976-1983), and Mork and Mindy (1978-1982).',
            "birth year": '1934',
            "death year": '2016',
        },
        "genre": {
            "name": 'Romantic Comedy',
            "description": 'The romantic comedy subgenre, also known as "rom-com", feature romantic relationships and interactions between characters while incorporating elements of humor and comedic situations. These stories blend the emotional journey of falling in love with lighthearted and funny scenarios, creating an entertaining and feel-good experience for the audience.',

        },
    },
    {
        "title": 'Interstellar',
        "description": 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        "director": {
            "name": 'Christopher Nolan',
            "bio": 'Best known for his cerebral, often nonlinear, storytelling, acclaimed Academy Award winner writer/director/producer Sir Christopher Nolan CBE was born in London, England. Over the course of more than 25 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made and became one of the most celebrated filmmakers of modern cinema.',
            "birth year": '1970',
            "death year": '',
        },
        "genre": {
            "name": 'Drama',
            "description": 'The drama genre is a broad category that features stories portraying human experiences, emotions, conflicts, and relationships in a realistic and emotionally impactful way. Dramas delve into the complexities of human life, often exploring themes of love, loss, morality, societal issues, personal growth, with the aim to evoke an emotional response from the audience by presenting relatable and thought-provoking stories.',

        },
    },
    {
        "title": 'Casablanca',
        "description": 'A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis in French Morocco.',
        "director": {
            "name": 'Michael Curtiz',
            "bio": 'Curtiz began acting in and then directing films in his native Hungary in 1912. After WWI, he continued his filmmaking career in Austria and Germany and into the early 1920s when he directed films in other countries in Europe. Moving to the US in 1926, he started making films in Hollywood for Warner Bros. and became thoroughly entrenched in the studio system. ',
            "birth year": '1886',
            "death year": '1962',
        },
        "genre": {
            "name": 'Drama',
            "description": 'The drama genre is a broad category that features stories portraying human experiences, emotions, conflicts, and relationships in a realistic and emotionally impactful way. Dramas delve into the complexities of human life, often exploring themes of love, loss, morality, societal issues, personal growth, with the aim to evoke an emotional response from the audience by presenting relatable and thought-provoking stories.',

        },
    },
    {
        "title": 'North by Northwest',
        "description": 'A New York City advertising executive goes on the run after being mistaken for a government agent by a group of foreign spies, and falls for a woman whose loyalties he begins to doubt.',
        "director": {
            "name": 'Alfred Hitchcock',
            "bio": 'Alfred Joseph Hitchcock was born in Leytonstone, Essex, England. He was the son of Emma Jane (Whelan; 1863 - 1942) and East End greengrocer William Hitchcock (1862 - 1914). His parents were both of half English and half Irish ancestry. He had two older siblings, William Hitchcock (born 1890) and Eileen Hitchcock (born 1892).',
            "birth year": '1899',
            "death year": '1980',
        },
        "genre": {
            "name": 'Spy',
            "description": 'The spy subgenre features espionage, covert operations, and intelligence activities. Characters often engage in high-stakes missions, infiltration, and intricate plots that involve espionage tactics, gadgets, and secret identities.',

        },
    },
    {
        "title": 'Up',
        "description": '78-year-old Carl Fredricksen travels to South America in his house equipped with balloons, inadvertently taking a young stowaway.',
        "director": {
            "name": 'Peter Docter',
            "bio": 'Pete Docter is the Oscar®-winning director of "Monsters, Inc.," "Up," and "Inside Out," and Chief Creative Officer at Pixar Animation Studios.',
            "birth year": '1968',
            "death year": '',
        },
        "genre": {
            "name": 'Adventure',
            "description": 'The adventure genre features exciting journeys, quests, or expeditions undertaken by characters who often face challenges, obstacles, and risks in pursuit of a goal. Adventures can take place in a wide range of settings, from exotic and fantastical locations to historical or even everyday environments.',

        },
    },
];

let users = [

    {
        "username": 'merylmeyl',
        "password": "password1223",
        "email": "meryl@email.com",
        "birthday": '05-24-1955',


    },
    {
        'username': 'martymkfly',
        "password": '891password',
        "email": 'marty@email.com',
        "birthday": '05-12-1970',

    },
    {
        "username": 'emperorkuz',
        "password": '345password',
        "email": 'kuzco@email.com',
        "birthday": '08-01-1945',

    }




]

app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));
app.use(express.json());

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');



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

//* get list of all users//

// app.get('/users', async (req, res) => {
//     await Users.find()
//         .then((users) => {
//             res.status(201).json(users);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//         });
// });


// *get user by username//

// app.get('/users/:Username', async (req, res) => {
//     await Users.findOne({ Username: req.params.Username })
//         .then((user) => {
//             res.json(user);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.statu(500).send('Error: ' + error);
//         });
// });

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


// app.listen(8080, () => {
//     console.log('Your app is listening on port 8080.');
// });

