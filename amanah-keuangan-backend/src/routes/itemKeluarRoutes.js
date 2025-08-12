// src/routes/itemKeluarRoutes.js
const express = require('express');
const router = express.Router();
const { getItemKeluar, addItemKeluar, updateItemKeluar, deleteItemKeluar } = require('../controllers/itemKeluarController');

router.route('/').get(getItemKeluar).post(addItemKeluar);
router.route('/:id').put(updateItemKeluar).delete(deleteItemKeluar);

module.exports = router;