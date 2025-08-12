// src/routes/kasMasukRoutes.js
const express = require('express');
const router = express.Router();
const { getKasMasuk, addKasMasuk, updateKasMasuk, deleteKasMasuk } = require('../controllers/kasMasukController');

router.route('/').get(getKasMasuk).post(addKasMasuk);
router.route('/:id').put(updateKasMasuk).delete(deleteKasMasuk);

module.exports = router;