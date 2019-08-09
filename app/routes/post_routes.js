const express = require('express')
const passport = require('passport')
const Post = require('../models/example')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })


const router = express.Router()


router.get('/examples', (req, res, next) => {
  Post.find()
    .then(examples => {
      return examples.map(example => example.toObject())
    })
    .then(examples => res.status(200).json({ examples: examples }))
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/examples/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Post.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(example => res.status(200).json({ example: example.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/examples', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  req.body.example.owner = req.user.id

  Post.create(req.body.example)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(example => {
      res.status(201).json({ example: example.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/examples/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.example.owner

  Post.findById(req.params.id)
    .then(handle404)
    .then(example => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, example)

      // pass the result of Mongoose's `.update` to the next `.then`
      return example.update(req.body.example)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/examples/:id', requireToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(handle404)
    .then(example => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, example)
      // delete the example ONLY IF the above didn't throw
      example.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
