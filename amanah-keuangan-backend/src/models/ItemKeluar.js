// src/models/ItemKeluar.js
const mongoose = require('mongoose');

const ItemKeluarSchema = new mongoose.Schema({
  kodeItem: {
    type: String,
    required: true,
  },
  namaItem: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
  },
  jumlah: {
    type: Number,
    required: true,
  },
  satuan: {
    type: String,
    required: true,
  },
  statusInput: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('ItemKeluar', ItemKeluarSchema);