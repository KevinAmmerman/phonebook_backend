const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connected to', url)
mongoose
  .connect(url)
  // eslint-disable-next-line no-unused-vars
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: [true, 'User phone number required'],
    validate: {
      validator: function (v) {
        return /^(?:\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(v)
      },
      message: (props) => `${props.value} is not a valid number`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
