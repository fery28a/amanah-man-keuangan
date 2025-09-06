const Piutang = require('../models/Piutang');

// Mengambil semua piutang yang belum lunas
exports.getPiutang = async (req, res) => {
  try {
    const piutang = await Piutang.find({ statusPembayaran: 'Belum Lunas' });
    res.status(200).json({ success: true, data: piutang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mengambil semua piutang yang sudah lunas
exports.getPiutangLunas = async (req, res) => {
  try {
    const piutang = await Piutang.find({ statusPembayaran: 'Lunas' });
    res.status(200).json({ success: true, data: piutang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Menambah piutang baru
exports.addPiutang = async (req, res) => {
  try {
    const newPiutang = await Piutang.create({ ...req.body, sisaPiutang: req.body.nominal });
    res.status(201).json({ success: true, data: newPiutang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Memperbarui piutang
exports.updatePiutang = async (req, res) => {
  try {
    const updatedPiutang = await Piutang.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPiutang) {
      return res.status(404).json({ success: false, error: 'Piutang not found' });
    }
    res.status(200).json({ success: true, data: updatedPiutang });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Menghapus piutang
exports.deletePiutang = async (req, res) => {
  try {
    const deletedPiutang = await Piutang.findByIdAndDelete(req.params.id);
    if (!deletedPiutang) {
      return res.status(404).json({ success: false, error: 'Piutang not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
