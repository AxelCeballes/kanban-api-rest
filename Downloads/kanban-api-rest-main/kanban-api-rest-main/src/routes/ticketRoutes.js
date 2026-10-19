const express = require('express');
const router = express.Router({ mergeParams: true });
const { createTicket, updateTicket } = require('../controllers/ticketController');
const { checkBoardExists, checkColumnBelongsToBoard } = require('../middleware/parentCheck');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', validateObjectId, checkBoardExists, checkColumnBelongsToBoard, createTicket);
router.patch('/:ticketId', validateObjectId, checkBoardExists, checkColumnBelongsToBoard, updateTicket);

module.exports = router;