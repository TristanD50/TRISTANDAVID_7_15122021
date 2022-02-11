const Like = require('../models/reactionModel')

exports.createLike = (req, res, next) => {
      Like.create({
        user_id: req.body.user_id,
        postId: req.body.postId,
       })
        .then(() => res.status(201).json({ message: 'Vous aimez ce post !'}))
        .catch((error) => {res.status(404).json({error: error})})
    }

exports.getAllLike = (req, res, next) => {
    Like.findAll({ where: { id: req.params.postId } })
    .then((like) => {res.status(200).json(like)})
    .catch((error) => {res.status(404).json({error: error})})
}