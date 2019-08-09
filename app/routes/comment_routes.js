const express = require('express')
const passport = require('passport')

const Comment = require('../models/comment')
const Post = require('../models/post')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

//

router.get('/comments', (req, res, next) => {
  Comment.find()
    .populate('post')
    .then(comments => {
      return comments.map(comment => comment.toObject())
    })
    .then(comments => {
      res.json({ comments })
    })
    .catch(next)
})

// SHOW //// GET /comments/5a7db6c74d55bc51bdf39793
router.get('/comments/:id', (req, res, next) => {
  Comment.findById(req.params.id)
    .populate('post')
    .then(handle404)
    .then(comment => res.status(200).json({ comment: comment.toObject() }))
    .catch(next)
})

// CREATE //// POST /comments
router.post('/comments', requireToken, (req, res, next) => {
  // set owner of new comment to be current user
  req.body.comment.owner = req.user.id

  Comment.create(req.body.comment)
    .then(comment => {
      res.status(201).json({ comment: comment.toObject() })
      let id = comment._id
      let postID = comment.post
      Post.findById(postID)
        .then(handle404)
        .then(foundPost => {
          foundPost.comment.push(id)
          let post = foundPost
          foundPost.update(post)
          console.log(foundPost)
          return comment
        })
        .then((post) => {
          res.status(200).json({post})
        })

        .catch(next)
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client

    .catch(next)
})

// UPDATE //// PATCH /comments/id
router.patch('/comments/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.comment.owner
  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      requireOwnership(req, comment)
      return comment.update(req.body.comment)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY //// DELETE /comments/id
router.delete('/comments/:id', requireToken, (req, res, next) => {
  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      requireOwnership(req, comment)
      comment.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
