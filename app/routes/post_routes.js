const express = require('express')
const passport = require('passport')
const Post = require('../models/post')
const Comment = require('../models/comment')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// CREATE POSTS WHILE LOGGED IN
router.post('/posts', requireToken, (req, res, next) => {
  // set owner of new post to be current user
  req.body.post.owner = req.user.id

  Post.create(req.body.post)
    // respond to succesful `create` with status 201 and JSON of new "post"
    .then(post => {
      res.status(201).json({ post: post.toObject() })
    })

    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// GET ALL POSTS WHILE NOT LOGGED IN
router.get('/posts', (req, res, next) => {
  Post.find()
    .populate('comment')
    .populate('owner')
    .then(posts => {
      console.log(posts._id)
      return posts.map(post => post.toObject())
    })
    .then(posts => res.status(200).json({ posts: posts }))
    .catch(next)
})

// GET USERS SPECIFIC POSTS WHILE LOGGED IN
// /posts/5a7db6c74d55bc51bdf39793

// router.get('/posts/:id', (req, res, next) => {
//   let foundPost
//   const id = req.params.id
//   Post.find()
//     .populate('comments')
//     .then(posts => {
//       foundPost = posts.toObject()
//       return Comment.find({Post: {_id: id}})
//     })
//     .then(comment => {
//       foundPost.comment = comment
//       res.json({foundPost})
//     })
//     .catch(next)
// })
router.get('/posts/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  const id = req.params.id

  let post
  Post.findById(id)
    .then(handle404)
    .then(foundPost => {
      post = foundPost.toObject()
      return Comment.find({post: id})
    })
    .then(comments => {
      post.comment = comments

      res.json({post})
    })
    .catch(next)
  // Post.findById(req.params.id)
  //   .populate('comment')
  //   .populate('owner')
  //   .then(handle404)
  //   // if `findById` is succesful, respond with 200 and "post" JSON
  //   .then(post => res.status(200).json({ post: post.toObject() }))
  //   // if an error occurs, pass it to the handler
  //   .catch(next)
})

// UPDATE USERS SPECIFIC POSTS WHILE LOGGED IN
// PATCH /posts/5a7db6c74d55bc51bdf39793
router.patch('/posts/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.post.owner

  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, post)

      // pass the result of Mongoose's `.update` to the next `.then`
      return post.update(req.body.post)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY POSTS WHILE LOGGED IN BELONGING TO SPECIFIC USER
// DELETE /posts/5a7db6c74d55bc51bdf39793
router.delete('/posts/:id', requireToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      // throw an error if current user doesn't own `post`
      requireOwnership(req, post)
      // delete the post ONLY IF the above didn't throw
      post.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
