require('dotenv').config();
const Person = require('./models/persons');
const express = require('express');
const morgan = require('morgan');
const app = express();
const loadedPersons = [];

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      '-',
      `${JSON.stringify(req.body)}`,
    ].join(' ');
  })
);

app.use(express.json());
app.use(express.static('dist'));

const checkIfContactExists = (name) => {
  return loadedPersons.some((person) => person.name.toLowerCase() === name.toLowerCase());
};

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    loadedPersons.concat(persons);
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const contact = request.body;
  const id = Math.floor(Math.random() * 10001);
  if (!contact.name || !contact.number) {
    return response.status(400).json({ error: 'name and number are required' });
  } else if (checkIfContactExists(contact.name)) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  const newPerson = new Person({
    name: contact.name,
    number: contact.number,
    id,
  });

  newPerson.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.get('/info', (request, response) => {
  const info = `<span>Phonebook has info for ${
    persons.length
  } people</span><br><br><span>${Date()}</span>`;
  response.send(info);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
