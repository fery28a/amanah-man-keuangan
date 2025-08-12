// src/routes/piutangRoutes.js
const express = require('express');
const router = express.Router();
const { getPiutang, addPiutang, updatePiutang, deletePiutang } = require('../controllers/piutangController');

router.route('/').get(getPiutang).post(addPiutang);
router.route('/:id').put(updatePiutang).delete(deletePiutang);

module.exports = router;