const express = require("express");
morgan = require('morgan');
fs = require('fs'), //import built in node modules fs and path
path = require('path');

const app = express();
//create a write stream (in append mode)
//a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

let topMovies = [
{
    title:'Death Becomes Her',
    Director: 'Robert Zemeckis',
    Genre: 'Comedy, Fantasy'
},
{
    title:'The Princess Bride',
    Director: 'Rob Reiner',
    Genre: 'Comedy, Fantasy'
},
{
    title:'The Witches',
    Director: 'Nicolas Roeg',
    Genre: 'Family, Horror'
},
{
    title:'The Emperor\'s New Groove',
    Director: 'Mark Dindal',
    Genre: 'Comedy, Family'
},
{
    title:'La La Land',
    Director: 'Damien Chazelle',
    Genre: 'Musical, Romance'
},
{
    title:'Runaway Bride',
    Director: 'Gary Marshall',
    Genre: 'Comedy, Romance'
},
{
    title:'Coming to America',
    Director: 'John Landis',
    Genre: 'Comedy, Romance'
},
{
    title:'Casablanca',
    Director: 'Michael Curtiz',
    Genre: 'Romance, War'
},
{
    title:'Thomas Crown Affair',
    Director: 'John McTiernan',
    Genre: 'Crime, Romance'
},
{
    title:'The Grand Budapest Hotel',
    Director: 'Wes Anderson',
    Genre: 'Caper, Quirky Comedy'
},
];

app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with a super top-secret content');
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