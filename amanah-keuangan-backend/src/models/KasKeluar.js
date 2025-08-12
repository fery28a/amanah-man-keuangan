// src/models/KasKeluar.js
const mongoose = require('mongoose');

const KasKeluarSchema = new mongoose.Schema({
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

module.exports = mongoose.model('KasKeluar', KasKeluarSchema);