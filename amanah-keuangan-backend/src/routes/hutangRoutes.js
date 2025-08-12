// src/routes/hutangRoutes.js
const express = require('express');
const router = express.Router();
const {
  getHutang,
  addHutang,
  updateHutang,
  deleteHutang,
} = require('../controllers/hutangController');

// Route untuk GET dan POST
router.route('/').get(getHutang).post(addHutang);

// Route untuk PUT dan DELETE
router.route('/:id').put(updateHutang).delete(deleteHutang);

module.exports = router;