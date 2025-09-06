const express = require('express');
const router = express.Router();
const { 
  getPiutang, 
  addPiutang, 
  updatePiutang, 
  deletePiutang, 
  getPiutangLunas 
} = require('../controllers/piutangController');

router.route('/').get(getPiutang).post(addPiutang);
router.route('/lunas').get(getPiutangLunas);
router.route('/:id').put(updatePiutang).delete(deletePiutang);

module.exports = router;
