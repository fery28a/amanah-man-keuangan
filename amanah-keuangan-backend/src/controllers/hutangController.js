// src/controllers/hutangController.js
const Hutang = require('../models/Hutang');

// @desc    Get all hutang
// @route   GET /api/hutang
exports.getHutang = async (req, res) => {
  try {
    const hutang = await Hutang.find();
    res.status(200).json({
      success: true,
      data: hutang,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Add new hutang
// @route   POST /api/hutang
exports.addHutang = async (req, res) => {
  try {
    const newHutang = await Hutang.create(req.body);
    res.status(201).json({
      success: true,
      data: newHutang,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Update hutang
// @route   PUT /api/hutang/:id
exports.updateHutang = async (req, res) => {
  try {
    const updatedHutang = await Hutang.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedHutang) {
      return res.status(404).json({
        success: false,
        error: 'Hutang not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedHutang,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete hutang
// @route   DELETE /api/hutang/:id
exports.deleteHutang = async (req, res) => {
  try {
    const deletedHutang = await Hutang.findByIdAndDelete(req.params.id);

    if (!deletedHutang) {
      return res.status(404).json({
        success: false,
        error: 'Hutang not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};