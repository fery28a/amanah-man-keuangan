// src/controllers/itemKeluarController.js
const ItemKeluar = require('../models/ItemKeluar');

exports.getItemKeluar = async (req, res) => {
  try {
    const items = await ItemKeluar.find();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addItemKeluar = async (req, res) => {
  try {
    const newItem = await ItemKeluar.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateItemKeluar = async (req, res) => {
  try {
    const updatedItem = await ItemKeluar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteItemKeluar = async (req, res) => {
  try {
    const deletedItem = await ItemKeluar.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};