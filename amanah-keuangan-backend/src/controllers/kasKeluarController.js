// src/controllers/kasKeluarController.js
const KasKeluar = require('../models/KasKeluar');

exports.getKasKeluar = async (req, res) => {
  try {
    const items = await KasKeluar.find();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addKasKeluar = async (req, res) => {
  try {
    const newItem = await KasKeluar.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateKasKeluar = async (req, res) => {
  try {
    const updatedItem = await KasKeluar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Kas Keluar not found' });
    }
    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteKasKeluar = async (req, res) => {
  try {
    const deletedItem = await KasKeluar.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Kas Keluar not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};