// src/models/Piutang.js
const mongoose = require('mongoose');

const PiutangSchema = new mongoose.Schema({
  deskripsi: {
    type: String,
    required: true,
  },
  namaKustomer: {
    type: String,
    required: true,
  },
  tanggalJatuhTempo: {
    type: Date,
    required: true,
  },
  nominal: {
    type: Number,
    required: true,
  },
  sisaPiutang: {
    type: Number,
    default: 0,
  },
  statusPembayaran: {
    type: String,
    enum: ['Lunas', 'Belum Lunas'],
    default: 'Belum Lunas',
  },
  statusInput: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Piutang', PiutangSchema);