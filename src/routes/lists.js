const express = require('express');
const {
  createList,
  getLists,
  getList,
  updateList,
  deleteList,
  likeList
} = require('../controllers/listController');
const { protect } = require('../middleware/auth');
const { validateList } = require('../middleware/validation');

const router = express.Router();

router.get('/', getLists);
router.get('/:id', getList);
router.post('/', protect, validateList, createList);
router.put('/:id', protect, validateList, updateList);
router.delete('/:id', protect, deleteList);
router.post('/:id/like', protect, likeList);

module.exports = router;