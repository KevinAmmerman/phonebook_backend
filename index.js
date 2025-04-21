/* eslint-disable no-unused-vars */
require('dotenv').config()
const Person = require('./models/persons')
const express = require('express')
const morgan = require('morgan')
const app = express()
const loadedPersons = []

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
    ].join(' ')
  })
)

app.use(express.json())
app.use(express.static('dist'))

const checkIfContactExists = (name) => {
  return loadedPersons.some((person) => person.name.toLowerCase() === name.toLowerCase())
}

app.get('/api/info', (_request, response) => {
  Person.countDocuments({}).then((count) => {
    if (count === 0) return response.status(400).end()
    const info = `<span>Phonebook has info for ${count} people</span><br><br><span>${Date()}</span>`
    response.send(info)
  })
})

app.get('/api/persons', (_request, response, next) => {
  Person.find({})
    .then((persons) => {
      loadedPersons.concat(persons)
      response.json(persons)
    })
    .catch(next)
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        return response.json(person)
      }
    })
    .catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then((_person) => {
      response.status(204).end()
    })
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  const contact = request.body
  if (!contact.name || !contact.number) {
    return response.status(400).json({ error: 'name and number are required' })
  } else if (checkIfContactExists(contact.name)) {
    console.log(contact)
    return response.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = new Person({
    name: contact.name,
    number: contact.number,
  })

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const number = request.body.number
  Person.findByIdAndUpdate(id, { number }, { new: true, runValidators: true })
    .then((person) => response.json(person))
    .catch(next)
})

const errorHandler = (error, _request, response, next) => {
  console.log('errorHandler', error)
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  response.status(500).send({ error: 'Something went wrong' })
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
