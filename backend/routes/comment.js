const express = require('express')
const router = express.Router()

const commentCtrl = require('../controllers/comment')
const auth = require('../middleware/auth')

router.post('/:id', auth, commentCtrl.createComment)
router.get('/', auth, commentCtrl.getAllComments)
router.get('/:id', auth, commentCtrl.getPostComment)
router.delete('/:id', auth, commentCtrl.deleteComment)

module.exports = router