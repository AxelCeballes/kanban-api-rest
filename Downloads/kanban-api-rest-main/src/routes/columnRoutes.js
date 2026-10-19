const express = require('express');
const router = express.Router({ mergeParams: true });
const { createColumn, deleteColumn } = require('../controllers/columnController');
const { checkBoardExists, checkColumnBelongsToBoard } = require('../middleware/parentCheck');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', validateObjectId, checkBoardExists, createColumn);
router.delete('/:columnId', validateObjectId, checkBoardExists, checkColumnBelongsToBoard, deleteColumn);

module.exports = router;