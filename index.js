const express = require("express");
morgan = require('morgan');
fs = require('fs'), //import built in node modules fs and path
path = require('path');
const uuid = require('uuid');

const app = express();
//create a write stream (in append mode)
//a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

let movies = [
{
    "title":'Death Becomes Her',
    "director": {
        "name":'Robert Zemeckis',
        "bio": '',
        "birth year": '',    
    },
    "genre": {
       "name":'Comedy'},
},
{
    "title":'The Princess Bride',
    "director": {
        "name": 'Rob Reiner',
        "bio": '',
        "birth year": '',
    } ,
    "genre": {
        "name": 'Comedy',
    }  
},
{
    "title":'The Emperor\'s New Groove',
    "director": {
        "name": 'Mark Dindal',
        "bio": '',
        "birth year": '',
    } ,
    "genre": {
        "name": 'Comedy',
    }  
},
];

let users = [

    {
        "name":'Meryl Streep',
        "favorites": ['Death Becomes Her'],
        "id": '1',
    },
    {
        "name":'Eartha Kitt',
        "favorites": ['The Emperor\'s New Groove'],
        "id": '2',
    },
    {
       "name":'Cary Elwes',
        "favorites": ['The Princess Bride'],
        "id": '3',
    },




]

app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

// get list of all movies//

app.get('/movies', (req, res) => {
    res.json(movies);
});

// get data about a movie by title//

app.get('/movies/:title', (req, res) => {

    res.send('Successful GET request returning movie by title');
});

// get data about a genre//

app.get('/movies/genres/:genre', (req, res) => {
    res.send('Successful GET request returning data about a genre');
});

// get data about a director//

app.get('/movies/directors/:director', (req, res) => {
    res.send('Successful GET request returning information about a director');
});

//allow a new user to register --broken

app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
        
    } else {
        res.status(400).send('New user is missing a name')
}
});

// allow a user to update their info//

app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const updateUser = req.body;

    let user = users.find(user => user.id === id);

    if (user) {
        
        res.status(201).send('Information updated successfully.');
    } else {
        res.status(404).send('User with id ' + req.params.id+ ' was not found.');
    }
  });
   
 //allow user to add a movie to their favorites  --broken
    
app.post('/users/:id/:favorites', (req, res) => {
    const id = req.params.id;
    const newFavorite = req.body;

    let user = users.find(user => user.id === id);
    
    if (!user) {   
    res.status(404).send('User doesn\'t exist');
} else {
    favorites.push(newFavorite);
    res.status(201).send('Movie added successfully to favorites')
}    
});

// allow user to remove a movie from their list of favorites //

app.delete('/users/:id/:favorites', (req, res) => {
    const id = req.params.id;
    const favorites = req.body;

    let user = users.find(user => user.id === id);

    if (user) {
        user.favorites = user.favorites.filter( title => title !== favorites);
    res.status(201).send('Movie has been removed from favorites');
} else {
    res.status(404).send('User doesn\'t exist');
}
});

//allow user to deregister //

app.delete('/users/:id', (req, res) => {
    const id = req.params.id;

    let user = users.find(user => user.id === id);

    if (user) {
        users = users.filter( user => user.id != id);
      res.status(201).send('User with id ' + req.params.id + ' was deleted.');
    } else {
        res.status(404).send('User with id ' + req.params.id+ ' was not found.');  
    }

});


app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});