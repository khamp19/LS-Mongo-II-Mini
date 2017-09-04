const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Person = require('./models.js');

const port = process.env.PORT || 3000;

const app = express();

// error status code constants
const STATUS_SERVER_ERROR = 500;
const STATUS_USER_ERROR = 422;

app.use(bodyParser.json());

// Your API will be built out here.
// GET - return all users
app.get('/people', (req, res) => {
  Person.find({}, (err, people) => {
    if(err) res.status(500).json({ error: 'cannot get people'});
    res.status(200).json(people);
  });
});

// GET - return all users sorted by firstName
/*promise method- .sort & .execute*/
// direction = 1 or -1 ie. /users/-1 OR /users/asc or /users/desc
app.get('/users/:direction', (req, res) => {
  const { direction } = req.params;
  Person.find({})
    .sort({ firstName: direction })
    .exec((err, people) => {
      if(err) res.status(500).json({ error: 'cannot get people'});
      res.status(200).json(people);
    });
});

// GET - return single user's friends
app.get('/user-get-friends/:id', (req, res) => {
  const { id } = req.params;
  Person.findById(id, (err, user) => {
    if(err) res.status(500).json({ error: 'cannot get friend list'});
    res.status(200).json(user.friends); //only return the property here
  });
});

// PUT- update users firstName adn lastName
app.put('/update-user/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  Person.findByIdAndUpdate(
    id, //find this id
    { //update these fields
      firstName,
      lastName,
    },
    { new: true } // returns the modified document instead of original
  ).exec((err, updatedUser) => {
    if(err) {
      res.status(422).json({ error: 'cannot update user' });
      return;
    }
    res.json(updatedUser);
  });
});

mongoose.Promise = global.Promise;
const connect = mongoose.connect(
  'mongodb://localhost/people',
  { useMongoClient: true }
);
/* eslint no-console: 0 */
connect.then(() => {
  app.listen(port);
  console.log(`Server Listening on ${port}`);
}, (err) => {
  console.log('\n************************');
  console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
  console.log('************************\n');
});
