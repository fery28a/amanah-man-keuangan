// src/controllers/kasMasukController.js
const KasMasuk = require('../models/KasMasuk');

exports.getKasMasuk = async (req, res) => {
  try {
    const items = await KasMasuk.find();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addKasMasuk = async (req, res) => {
  try {
    const newItem = await KasMasuk.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateKasMasuk = async (req, res) => {
  try {
    const updatedItem = await KasMasuk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Kas Masuk not found' });
    }
    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteKasMasuk = async (req, res) => {
  try {
    const deletedItem = await KasMasuk.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Kas Masuk not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};