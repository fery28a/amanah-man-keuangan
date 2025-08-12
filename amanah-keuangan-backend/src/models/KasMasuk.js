// src/models/KasMasuk.js
const mongoose = require('mongoose');

const KasMasukSchema = new mongoose.Schema({
  deskripsi: {
    type: String,
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
  },
  nominal: {
    type: Number,
    required: true,
  },
  statusInput: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('KasMasuk', KasMasukSchema);