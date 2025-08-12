// src/routes/kasKeluarRoutes.js
const express = require('express');
const router = express.Router();
const { getKasKeluar, addKasKeluar, updateKasKeluar, deleteKasKeluar } = require('../controllers/kasKeluarController');

router.route('/').get(getKasKeluar).post(addKasKeluar);
router.route('/:id').put(updateKasKeluar).delete(deleteKasKeluar);

module.exports = router;