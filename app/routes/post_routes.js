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

//
router.get('/posts', (req, res, next) => {
  Post.find()
    .populate('comment')
    .populate('owner')
    .then(posts => {
      return posts.map(post => post.toObject())
    })
    .then(posts => {
      res.json({ posts })
    })
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

// CREATE //// POST /posts
router.post('/posts', requireToken, (req, res, next) => {
  req.body.post.owner = req.user.id
  Post.create(req.body.post)
    .then(post => {
      res.status(201).json({ post: post.toObject() })
    })
    .catch(next)
})

// UPDATE //// PATCH /posts/id
router.patch('/posts/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.post.owner
  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      requireOwnership(req, post)
      return post.update(req.body.post)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY //// DELETE /posts/id
router.delete('/posts/:id', requireToken, (req, res, next) => {
  Post.findById(req.params.id)
    .then(handle404)
    .then(post => {
      requireOwnership(req, post)
      post.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
