const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
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

const checkIfContactExists = (name) => {
  return persons.some((person) => person.name.toLowerCase() === name.toLowerCase());
};

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
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

  const newContact = {
    name: contact.name,
    number: contact.number,
    id,
  };

  persons = persons.concat(newContact);
  response.json(newContact);
});

app.get('/info', (request, response) => {
  const info = `<span>Phonebook has info for ${
    persons.length
  } people</span><br><br><span>${Date()}</span>`;
  response.send(info);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
