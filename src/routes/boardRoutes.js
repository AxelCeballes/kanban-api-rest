const express = require('express');
const router = express.Router({ mergeParams: true });
const { createBoard, getBoardById } = require('../controllers/boardController');
const { checkBoardExists } = require('../middleware/parentCheck');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', createBoard);
router.get('/:boardId', validateObjectId, checkBoardExists, getBoardById);

module.exports = router;